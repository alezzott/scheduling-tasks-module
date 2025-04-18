import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { formatDate } from './format-date';

export function saveReportsToFile(reports: any[], reportsDir: string, fileName: string) {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const filePath = path.join(reportsDir, fileName);

  let allReports = [];
  if (fs.existsSync(filePath)) {
    try {
      const existing = fs.readFileSync(filePath, 'utf-8');
      allReports = JSON.parse(existing);
    } catch {
      allReports = [];
    }
  }
  // Formata as datas antes de salvar
  const formattedReports = reports.map(r => ({
    ...r,
    startTime: formatDate(r.startTime),
    endTime: formatDate(r.endTime),
  }));
  allReports = allReports.concat(formattedReports);

  try {
    fs.writeFileSync(filePath, JSON.stringify(allReports, null, 2));
    console.log(chalk.greenBright(`[INFO] Relatório salvo em: ${filePath}`));
  } catch (err) {
    console.error(chalk.red(`[ERRO] Falha ao salvar relatório em: ${filePath}`), err);
  }
}
