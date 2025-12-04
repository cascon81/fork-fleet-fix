import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { AddRentalModal } from '@/components/modals/AddRentalModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Eye, MoreHorizontal, Search, Loader2, FileText, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { DbRental, DbForklift, DbClient } from '@/types/forklift';
import { generateContractPDF } from '@/lib/generateContractPDF';
import { useNotifications } from '@/hooks/useNotifications';

const statusConfig = {
  ativo: { label: 'Ativo', variant: 'success' as const },
  finalizado: { label: 'Finalizado', variant: 'secondary' as const },
  atrasado: { label: 'Atrasado', variant: 'destructive' as const },
};

const Alugueis = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rentals, setRentals] = useState<DbRental[]>([]);
  const [forklifts, setForklifts] = useState<DbForklift[]>([]);
  const [clients, setClients] = useState<DbClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { sendRentalCreatedNotification } = useNotifications();

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [rentalsRes, forkliftsRes, clientsRes] = await Promise.all([
        supabase.from('rentals').select('*').order('created_at', { ascending: false }),
        supabase.from('forklifts').select('*'),
        supabase.from('clients').select('*'),
      ]);

      if (rentalsRes.error) throw rentalsRes.error;
      if (forkliftsRes.error) throw forkliftsRes.error;
      if (clientsRes.error) throw clientsRes.error;

      setRentals(rentalsRes.data || []);
      setForklifts(forkliftsRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar aluguéis: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getForklift = (id: string) => forklifts.find(f => f.id === id);
  const getClientByName = (name: string) => clients.find(c => c.nome === name);

  const handleGenerateContract = (rental: DbRental) => {
    const forklift = getForklift(rental.forklift_id);
    const client = getClientByName(rental.cliente);

    if (!forklift || !client) {
      toast.error('Dados incompletos para gerar contrato');
      return;
    }

    generateContractPDF({
      clientName: client.nome,
      clientCnpj: client.cnpj,
      clientAddress: client.endereco,
      clientPhone: client.telefone,
      clientEmail: client.email,
      clientContact: client.contato,
      forkliftPlaca: forklift.placa,
      forkliftModelo: forklift.modelo,
      forkliftMarca: forklift.marca,
      forkliftCapacidade: forklift.capacidade,
      forkliftAno: forklift.ano_fabricacao,
      startDate: rental.data_inicio,
      endDate: rental.data_fim,
      dailyRate: Number(rental.valor_diaria),
    });

    toast.success('Contrato gerado com sucesso!');
  };

  const handleSendNotification = async (rental: DbRental) => {
    const forklift = getForklift(rental.forklift_id);
    const client = getClientByName(rental.cliente);

    if (!forklift || !client) {
      toast.error('Dados incompletos para enviar notificação');
      return;
    }

    await sendRentalCreatedNotification(
      client.email,
      client.nome,
      forklift.placa,
      `${forklift.marca} ${forklift.modelo}`,
      format(new Date(rental.data_inicio), 'dd/MM/yyyy'),
      format(new Date(rental.data_fim), 'dd/MM/yyyy'),
      Number(rental.valor_diaria)
    );
  };

  const filteredRentals = useMemo(() => {
    return rentals.filter(rental => {
      const forklift = getForklift(rental.forklift_id);
      const searchLower = searchTerm.toLowerCase();
      return (
        rental.cliente.toLowerCase().includes(searchLower) ||
        forklift?.placa.toLowerCase().includes(searchLower) ||
        forklift?.marca.toLowerCase().includes(searchLower)
      );
    });
  }, [rentals, forklifts, searchTerm]);

  const stats = useMemo(() => {
    const activeRentals = rentals.filter(r => r.status === 'ativo' || r.status === 'atrasado');
    const totalRevenue = activeRentals.reduce((sum, r) => {
      const days = Math.ceil(
        (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
      );
      return sum + (Number(r.valor_diaria) * days);
    }, 0);

    return {
      total: rentals.length,
      ativos: rentals.filter(r => r.status === 'ativo').length,
      atrasados: rentals.filter(r => r.status === 'atrasado').length,
      receita: totalRevenue,
    };
  }, [rentals]);

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      fetchData();
    }
  };

  return (
    <MainLayout title="Gestão de Aluguéis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou empilhadeira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Aluguel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de Contratos</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-success">{stats.ativos}</p>
          </div>
          <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-4">
            <p className="text-sm text-muted-foreground">Atrasados</p>
            <p className="text-2xl font-bold text-destructive">{stats.atrasados}</p>
          </div>
          <div className="rounded-lg border bg-primary/10 border-primary/20 p-4">
            <p className="text-sm text-muted-foreground">Receita Estimada</p>
            <p className="text-2xl font-bold text-primary">
              R$ {stats.receita.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Nenhum aluguel encontrado com os filtros aplicados.'
                : 'Nenhum aluguel cadastrado. Adicione seu primeiro aluguel!'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="font-semibold">Empilhadeira</TableHead>
                  <TableHead className="font-semibold">Data Início</TableHead>
                  <TableHead className="font-semibold">Data Fim</TableHead>
                  <TableHead className="font-semibold">Valor Diária</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => {
                  const forklift = getForklift(rental.forklift_id);
                  const config = statusConfig[rental.status];
                  
                  return (
                    <TableRow key={rental.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{rental.cliente}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{forklift?.placa || '-'}</p>
                          <p className="text-sm text-muted-foreground">
                            {forklift?.marca} {forklift?.modelo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(rental.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(rental.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>R$ {Number(rental.valor_diaria).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleGenerateContract(rental)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Gerar Contrato PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendNotification(rental)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Enviar E-mail
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AddRentalModal open={isAddModalOpen} onOpenChange={handleModalClose} />
    </MainLayout>
  );
};

export default Alugueis;
