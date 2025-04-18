import { Task } from '../core/entities/Task';

export type TaskMiddleware = (task: Task, next: () => Promise<void>) => Promise<void>;

export interface ITaskMiddleware {
  handle(task: Task, next: () => Promise<void>): Promise<void>;
}
