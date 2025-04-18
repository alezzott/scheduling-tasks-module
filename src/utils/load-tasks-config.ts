import * as fs from 'fs';

export interface TaskConfig {
  id: string;
  type: string;
  [key: string]: any;
}

export function loadTasksConfig(configPath: string): TaskConfig[] {
  try {
    const fileContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(fileContent);
    if (!Array.isArray(config)) {
      throw new Error('Configuração de tasks deve ser um array.');
    }
    console.log(`[INFO] Carregando ${config.length} tasks do arquivo de configuração.`);
    return config;
  } catch (err) {
    console.error(`[ERRO] Falha ao ler ou parsear o arquivo de configuração:`, err);
    process.exit(1);
  }
}
