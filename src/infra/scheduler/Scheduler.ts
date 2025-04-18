import { Task } from '../../core/entities/Task';
import { IScheduler } from '../../core/interfaces/IScheduler';
import { ScheduleMetadata } from '../../core/value-objects/ScheduleMetadata';
import { TaskMiddleware } from '../../middlewares/TaskMiddleware';
import { Logger as DefaultLogger } from '../logger/Logger';
import { Reporter as DefaultReporter, TaskExecutionReport } from '../reporter/Reporter';

interface SchedulerOptions {
  maxRetries?: number;
  logger?: typeof DefaultLogger;
  reporter?: DefaultReporter;
  middlewares?: TaskMiddleware[];
}

export class Scheduler implements IScheduler {
  private readonly tasks = new Map<string, Task>();
  private readonly reporter: DefaultReporter;
  private readonly logger: typeof DefaultLogger;
  private readonly maxRetries: number;
  private readonly middlewares: TaskMiddleware[];

  constructor(options?: SchedulerOptions) {
    this.maxRetries = options?.maxRetries ?? 3;
    this.logger = options?.logger ?? DefaultLogger;
    this.reporter = options?.reporter ?? new DefaultReporter();
    this.middlewares = options?.middlewares ?? [];
  }

  addTask(task: Task): void {
    if (this.tasks.has(task.id)) {
      throw new Error(`Task ${task.id} already exists`);
    }
    if (!this.isValidSchedule(task.schedule)) {
      this.logger.error(`[${task.id}] Metadados de agendamento inválidos.`);
      throw new Error(`Invalid schedule metadata for task ${task.id}`);
    }
    this.tasks.set(task.id, task);
    this.scheduleTask(task);
  }

  private isValidSchedule(schedule: ScheduleMetadata): boolean {
    if (schedule.type === 'interval') {
      return typeof schedule.intervalSeconds === 'number' && schedule.intervalSeconds > 0;
    }
    if (schedule.type === 'fixed') {
      return typeof schedule.fixedTime === 'string' && !!schedule.fixedTime;
    }
    return false;
  }

  private scheduleTask(task: Task): void {
    if (task.schedule.type === 'interval' && task.schedule.intervalSeconds) {
      setInterval(() => this.runTaskWithMiddlewares(task), task.schedule.intervalSeconds * 1000);
    } else if (task.schedule.type === 'fixed' && task.schedule.fixedTime) {
      this.scheduleAtFixedTime(task);
    }
  }

  private scheduleAtFixedTime(task: Task): void {
    const delay = this.calculateDelayToNextFixedTime(task.schedule.fixedTime!);
    setTimeout(() => {
      this.runTaskWithMiddlewares(task);
      this.scheduleAtFixedTime(task);
    }, delay);
  }

  private calculateDelayToNextFixedTime(fixedTime: string): number {
    const now = new Date();
    const [hours, minutes] = fixedTime.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    return next.getTime() - now.getTime();
  }

  // Executa a cadeia de middlewares antes de rodar a task
  private async runTaskWithMiddlewares(task: Task): Promise<void> {
    let idx = -1;
    const dispatch = async (i: number): Promise<void> => {
      if (i <= idx) throw new Error('next() called multiple times');
      idx = i;
      const mw = this.middlewares[i];
      if (mw) {
        await mw(task, () => dispatch(i + 1));
      } else {
        await this.runTask(task);
      }
    };
    await dispatch(0);
  }

  private async runTask(task: Task): Promise<void> {
    const report: TaskExecutionReport = {
      taskId: task.id,
      startTime: new Date(),
      endTime: new Date(),
      success: false,
      error: undefined,
      retries: 0,
    };

    this.logger.info(`[${task.id}] Iniciando execução`);
    await this.executeWithRetry(task, this.maxRetries, report);
    report.endTime = new Date();
    this.reporter.addReport(report);
    this.logger.info(`[${task.id}] Execução finalizada`);
  }

  private async executeWithRetry(
    task: Task,
    maxRetries: number,
    report: TaskExecutionReport
  ): Promise<void> {
    let retries = 0;
    while (retries <= maxRetries) {
      try {
        await task.execute();
        this.logger.success(`[${task.id}] Execução concluída com sucesso`);
        report.success = true;
        return;
      } catch (err: any) {
        retries++;
        report.retries = retries;
        report.error = err.message;
        this.logger.error(`[${task.id}] Erro: ${err.message}. Tentativa ${retries}/${maxRetries}`);
        if (retries > maxRetries) {
          this.logger.error(`[${task.id}] Falha definitiva após ${maxRetries} tentativas`);
          if (typeof task.fallback === 'function') {
            try {
              await task.fallback(err);
              this.logger.info(`[${task.id}] Fallback executado com sucesso.`);
            } catch (fallbackErr: any) {
              this.logger.error(`[${task.id}] Erro no fallback: ${fallbackErr.message}`);
            }
          }
        }
      }
    }
  }

  getReports() {
    return this.reporter.getReports();
  }
}
