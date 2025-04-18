import chalk from 'chalk';
import { ITaskMiddleware, TaskMiddleware } from '../../middlewares/TaskMiddleware';
import { Task } from '../../core/entities/Task';

export class Logger {
  static info(msg: string) {
    console.log(chalk.blue(`[INFO] ${new Date().toISOString()} - ${msg}`));
  }
  static error(msg: string) {
    console.error(chalk.red(`[ERROR] ${new Date().toISOString()} - ${msg}`));
  }
  static success(msg: string) {
    console.log(chalk.green(`[SUCCESS] ${new Date().toISOString()} - ${msg}`));
  }
  static warn(msg: string) {
    console.warn(chalk.yellow(`[WARN] ${new Date().toISOString()} - ${msg}`));
  }
}

export class LogMiddleware implements ITaskMiddleware {
  async handle(task: Task, next: () => Promise<void>): Promise<void> {
    console.log(`[MIDDLEWARE] Antes da task ${task.id}`);
    await next();
    console.log(`[MIDDLEWARE] Depois da task ${task.id}`);
  }
}

// Adaptador para usar classe como TaskMiddleware (função)
export const logMiddleware: TaskMiddleware = async (task, next) => {
  const mw = new LogMiddleware();
  await mw.handle(task, next);
};
