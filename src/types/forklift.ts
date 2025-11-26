export type ForkliftStatus = 'disponivel' | 'alugada' | 'manutencao';

export interface Forklift {
  id: string;
  modelo: string;
  marca: string;
  capacidade: string;
  anoFabricacao: number;
  placa: string;
  status: ForkliftStatus;
  ultimaManutencao: string;
  proximaManutencao: string;
  horasUso: number;
}

export interface Rental {
  id: string;
  forkliftId: string;
  cliente: string;
  dataInicio: string;
  dataFim: string;
  valorDiaria: number;
  status: 'ativo' | 'finalizado' | 'atrasado';
}

export interface Maintenance {
  id: string;
  forkliftId: string;
  tipo: 'preventiva' | 'corretiva';
  descricao: string;
  dataAgendada: string;
  dataConclusao?: string;
  status: 'agendada' | 'em_andamento' | 'concluida';
  custo?: number;
}
