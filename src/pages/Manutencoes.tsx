import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo } from 'react';
import { AddMaintenanceModal } from '@/components/modals/AddMaintenanceModal';
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
import { Plus, Eye, MoreHorizontal, Wrench, AlertTriangle, Search, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import type { DbMaintenance, DbForklift } from '@/types/forklift';

const statusConfig = {
  agendada: { label: 'Agendada', variant: 'info' as const },
  em_andamento: { label: 'Em Andamento', variant: 'warning' as const },
  concluida: { label: 'Concluída', variant: 'success' as const },
};

const tipoConfig = {
  preventiva: { label: 'Preventiva', variant: 'secondary' as const },
  corretiva: { label: 'Corretiva', variant: 'destructive' as const },
};

const Manutencoes = () => {
  const { user } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [maintenances, setMaintenances] = useState<DbMaintenance[]>([]);
  const [forklifts, setForklifts] = useState<DbForklift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [maintenancesRes, forkliftsRes] = await Promise.all([
        supabase.from('maintenances').select('*').order('data_agendada', { ascending: false }),
        supabase.from('forklifts').select('*'),
      ]);

      if (maintenancesRes.error) throw maintenancesRes.error;
      if (forkliftsRes.error) throw forkliftsRes.error;

      setMaintenances(maintenancesRes.data || []);
      setForklifts(forkliftsRes.data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar manutenções: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getForklift = (id: string) => forklifts.find(f => f.id === id);

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter(m => {
      const forklift = getForklift(m.forklift_id);
      const searchLower = searchTerm.toLowerCase();
      return (
        m.descricao.toLowerCase().includes(searchLower) ||
        forklift?.placa.toLowerCase().includes(searchLower) ||
        forklift?.marca.toLowerCase().includes(searchLower)
      );
    });
  }, [maintenances, forklifts, searchTerm]);

  const stats = useMemo(() => ({
    total: maintenances.length,
    pendentes: maintenances.filter(m => m.status !== 'concluida').length,
    concluidas: maintenances.filter(m => m.status === 'concluida').length,
    custoTotal: maintenances
      .filter(m => m.custo)
      .reduce((sum, m) => sum + Number(m.custo || 0), 0),
  }), [maintenances]);

  const emAndamento = maintenances.filter(m => m.status === 'em_andamento');

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      fetchData();
    }
  };

  return (
    <MainLayout title="Gestão de Manutenções">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou empilhadeira..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Agendar Manutenção
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-warning/10 border-warning/20 p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-warning">{stats.pendentes}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold text-success">{stats.concluidas}</p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {stats.custoTotal.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Alert for urgent maintenance */}
        {emAndamento.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-warning/10 border border-warning/20 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">Manutenções em andamento</p>
              <p className="text-sm text-muted-foreground">
                {emAndamento.length} manutenção(ões) precisam de atenção
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredMaintenances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Nenhuma manutenção encontrada com os filtros aplicados.'
                : 'Nenhuma manutenção cadastrada. Agende sua primeira manutenção!'}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card shadow-card overflow-hidden animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">Empilhadeira</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="font-semibold">Data Agendada</TableHead>
                  <TableHead className="font-semibold">Custo</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaintenances.map((maintenance) => {
                  const forklift = getForklift(maintenance.forklift_id);
                  const statusCfg = statusConfig[maintenance.status];
                  const tipoCfg = tipoConfig[maintenance.tipo];
                  
                  return (
                    <TableRow key={maintenance.id} className="hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                            <Wrench className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{forklift?.placa || '-'}</p>
                            <p className="text-sm text-muted-foreground">
                              {forklift?.marca} {forklift?.modelo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={tipoCfg.variant}>{tipoCfg.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{maintenance.descricao}</TableCell>
                      <TableCell>
                        {format(new Date(maintenance.data_agendada), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {maintenance.custo 
                          ? `R$ ${Number(maintenance.custo).toLocaleString('pt-BR')}` 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
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

      <AddMaintenanceModal open={isAddModalOpen} onOpenChange={handleModalClose} />
    </MainLayout>
  );
};

export default Manutencoes;
