import { Task } from '../entities/Task';

export interface IScheduler {
  addTask(task: Task): void;
  getReports(): any[];
}
