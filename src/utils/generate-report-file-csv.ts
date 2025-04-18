import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { formatDate } from './format-date';

export function saveReportsToCsv(reports: any[], reportsDir: string, fileName: string) {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const csvFileName = fileName.replace('.json', '.csv');
  const filePath = path.join(reportsDir, csvFileName);

  const csvHeader = 'taskId,startTime,endTime,success,error,retries\n';
  const csvRows = reports.map((r: any) =>
    [
      r.taskId,
      formatDate(r.startTime),
      formatDate(r.endTime),
      r.success !== undefined && r.success !== null ? r.success : '-',
      r.error ? `"${String(r.error).replace(/"/g, '""')}"` : '-',
      r.retries !== undefined && r.retries !== null ? r.retries : '-',
    ].join(',')
  );
  const csvContent = csvHeader + csvRows.join('\n');

  fs.writeFileSync(filePath, csvContent);
  console.log(chalk.greenBright(`[INFO] Relatório CSV salvo em: ${filePath}`));
}
