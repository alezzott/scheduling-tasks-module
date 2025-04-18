import { Task } from '../entities/Task';

export interface ITaskExecutor {
  execute(task: Task): Promise<{ success: boolean; error?: Error }>;
}
