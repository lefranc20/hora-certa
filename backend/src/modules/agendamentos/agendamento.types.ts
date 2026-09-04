export interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  inicio: Date;
  fim: Date;
  profissionalId: string;
  canceladoEm: Date | null;
  observacaoCancelamento: string | null;
}
