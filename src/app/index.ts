import chalk from 'chalk';
import { logMiddleware } from '../infra/logger/Logger';
import { Scheduler } from '../infra/scheduler/Scheduler';
import { ExampleTask } from './ExampleTask';
import * as path from 'path';
import { loadTasksConfig, TaskConfig } from '../utils/load-tasks-config';
import { generateReportFileName } from '../utils/generate-report-file-json';
import { saveReportsToFile } from '../utils/save-report-file';
import { ScheduleMetadata, ScheduleType } from '../core/value-objects/ScheduleMetadata';
import { saveReportsToCsv } from '../utils/generate-report-file-csv';

const scheduler = new Scheduler({
  maxRetries: 5,
  middlewares: [logMiddleware],
});

const tasksConfigPath = path.resolve(__dirname, '../config/config-task.json');
const tasksConfig = loadTasksConfig(tasksConfigPath);

tasksConfig.forEach((taskConfig: TaskConfig) => {
  if (!taskConfig.id || !taskConfig.type) {
    console.warn(chalk.yellow(`[WARN] Task ignorada por falta de id ou type:`), taskConfig);
    return;
  }
  const { id, ...schedule } = taskConfig;
  const scheduleMetadata = new ScheduleMetadata({
    ...schedule,
    type: taskConfig.type as ScheduleType,
  });
  const task = new ExampleTask(id, scheduleMetadata);
  scheduler.addTask(task);
});

setTimeout(() => {
  const reports = scheduler.getReports();
  const reportsDir = path.resolve(__dirname, '../reports');
  const fileName = generateReportFileName();
  saveReportsToFile(reports, reportsDir, fileName);
  saveReportsToCsv(reports, reportsDir, fileName);
}, 10000);
