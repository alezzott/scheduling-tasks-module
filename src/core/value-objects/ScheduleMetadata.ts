export type ScheduleType = 'interval' | 'fixed';

export interface ScheduleMetadataProps {
  type: ScheduleType;
  intervalSeconds?: number;
  fixedTime?: string;
}

export class ScheduleMetadata {
  type: ScheduleType;
  intervalSeconds?: number;
  fixedTime?: string;
  constructor(props: ScheduleMetadataProps) {
    this.type = props.type;
    this.intervalSeconds = props.intervalSeconds;
    this.fixedTime = props.fixedTime;
  }
}
