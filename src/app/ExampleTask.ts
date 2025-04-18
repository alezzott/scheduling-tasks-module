import { Task } from '../core/entities/Task';

// Exemplo de implementação de uma task customizada
export class ExampleTask extends Task {
  // Lógica principal da task
  async execute(): Promise<void> {
    console.log(`[${this.id}] Executando tarefa de exemplo...`);
    // Simula falha aleatória
    if (Math.random() < 0.3) throw new Error('Erro aleatório!');
  }

  // Fallback chamado em caso de falha após tentativas
  async fallback(error: Error): Promise<void> {
    console.log(`[${this.id}] Executando fallback após falha: ${error.message}`);
  }
}
