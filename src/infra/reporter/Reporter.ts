export interface TaskExecutionReport {
  taskId: string;
  startTime: Date;
  endTime: Date;
  success: boolean;
  error?: string;
  retries: number;
}

export class Reporter {
  private reports: TaskExecutionReport[] = [];

  addReport(report: TaskExecutionReport) {
    this.reports.push(report);
  }

  getReports() {
    return this.reports;
  }
}
