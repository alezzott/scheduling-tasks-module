export const pad = (n: number) => n.toString().padStart(2, '0');

export function generateReportFileName(): string {
  const now = new Date();
  const dateStr = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}_${pad(
    now.getHours()
  )}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
  return `task-reports-${dateStr}.json`;
}
