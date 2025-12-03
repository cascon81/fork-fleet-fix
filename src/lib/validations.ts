import { z } from 'zod';

// Client validation schema
export const clientSchema = z.object({
  nome: z.string().min(1, 'Razão social é obrigatória').max(200, 'Máximo 200 caracteres'),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido (formato: 00.000.000/0000-00)'),
  contato: z.string().min(1, 'Nome do contato é obrigatório').max(100, 'Máximo 100 caracteres'),
  telefone: z.string().regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido (formato: (00) 00000-0000)'),
  email: z.string().email('E-mail inválido').max(255, 'Máximo 255 caracteres'),
  endereco: z.string().min(1, 'Endereço é obrigatório').max(500, 'Máximo 500 caracteres'),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Forklift validation schema
export const forkliftSchema = z.object({
  placa: z.string().min(1, 'Placa/ID é obrigatória').max(20, 'Máximo 20 caracteres'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório').max(50, 'Máximo 50 caracteres'),
  capacidade: z.string().min(1, 'Capacidade é obrigatória'),
  anoFabricacao: z.coerce.number()
    .int('Ano deve ser um número inteiro')
    .min(1990, 'Ano mínimo: 1990')
    .max(new Date().getFullYear() + 1, `Ano máximo: ${new Date().getFullYear() + 1}`),
  horasUso: z.coerce.number()
    .int('Horas deve ser um número inteiro')
    .min(0, 'Horas de uso não pode ser negativo')
    .max(100000, 'Máximo 100.000 horas'),
});

export type ForkliftFormData = z.infer<typeof forkliftSchema>;

// Rental validation schema
export const rentalSchema = z.object({
  forkliftId: z.string().uuid('Selecione uma empilhadeira'),
  cliente: z.string().min(1, 'Nome do cliente é obrigatório').max(200, 'Máximo 200 caracteres'),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de término é obrigatória'),
  valorDiaria: z.coerce.number()
    .min(0.01, 'Valor da diária deve ser maior que zero')
    .max(100000, 'Valor máximo: R$ 100.000'),
}).refine((data) => {
  if (data.dataInicio && data.dataFim) {
    return new Date(data.dataFim) >= new Date(data.dataInicio);
  }
  return true;
}, {
  message: 'Data de término deve ser igual ou posterior à data de início',
  path: ['dataFim'],
});

export type RentalFormData = z.infer<typeof rentalSchema>;

// Maintenance validation schema
export const maintenanceSchema = z.object({
  forkliftId: z.string().uuid('Selecione uma empilhadeira'),
  tipo: z.enum(['preventiva', 'corretiva'], { 
    required_error: 'Selecione o tipo de manutenção' 
  }),
  descricao: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(1000, 'Máximo 1000 caracteres'),
  dataAgendada: z.string().min(1, 'Data agendada é obrigatória'),
  custo: z.union([
    z.literal(''),
    z.coerce.number().min(0, 'Custo não pode ser negativo').max(1000000, 'Máximo R$ 1.000.000')
  ]).optional(),
});

export type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const signupSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
