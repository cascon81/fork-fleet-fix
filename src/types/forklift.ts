import { Tables } from '@/integrations/supabase/types';

// DB types from Supabase
export type DbForklift = Tables<'forklifts'>;
export type DbClient = Tables<'clients'>;
export type DbRental = Tables<'rentals'>;
export type DbMaintenance = Tables<'maintenances'>;

// Legacy types for compatibility (can be removed when fully migrated)
export type ForkliftStatus = 'disponivel' | 'alugada' | 'manutencao';

export interface Forklift {
  id: string;
  modelo: string;
  marca: string;
  capacidade: string;
  anoFabricacao: number;
  placa: string;
  status: ForkliftStatus;
  ultimaManutencao: string | null;
  proximaManutencao: string | null;
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

// Helper to convert DB forklift to frontend format
export function mapDbForklift(db: DbForklift): Forklift {
  return {
    id: db.id,
    modelo: db.modelo,
    marca: db.marca,
    capacidade: db.capacidade,
    anoFabricacao: db.ano_fabricacao,
    placa: db.placa,
    status: db.status,
    ultimaManutencao: db.ultima_manutencao,
    proximaManutencao: db.proxima_manutencao,
    horasUso: db.horas_uso,
  };
}
