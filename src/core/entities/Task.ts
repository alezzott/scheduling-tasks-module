import { ScheduleMetadata } from '../value-objects/ScheduleMetadata';

export abstract class Task {
  constructor(public readonly id: string, public readonly schedule: ScheduleMetadata) {}

  abstract execute(): Promise<void>;
  async fallback?(error: Error): Promise<void>;
}
