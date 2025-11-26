import { MainLayout } from '@/components/layout/MainLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { maintenances, forklifts } from '@/data/mockData';
import { Plus, Eye, MoreHorizontal, Wrench, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const getForklift = (id: string) => forklifts.find(f => f.id === id);

  const pendingCount = maintenances.filter(m => m.status !== 'concluida').length;
  const totalCost = maintenances
    .filter(m => m.custo)
    .reduce((sum, m) => sum + (m.custo || 0), 0);

  return (
    <MainLayout title="Gestão de Manutenções">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Acompanhe as manutenções preventivas e corretivas
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Agendar Manutenção
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="text-2xl font-bold text-foreground">{maintenances.length}</p>
          </div>
          <div className="rounded-lg border bg-warning/10 border-warning/20 p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <p className="text-2xl font-bold text-success">
              {maintenances.filter(m => m.status === 'concluida').length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Custo Total</p>
            <p className="text-2xl font-bold text-foreground">
              R$ {totalCost.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Alert for urgent maintenance */}
        {maintenances.filter(m => m.status === 'em_andamento').length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-warning/10 border border-warning/20 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-foreground">Manutenções em andamento</p>
              <p className="text-sm text-muted-foreground">
                {maintenances.filter(m => m.status === 'em_andamento').length} manutenção(ões) 
                precisam de atenção
              </p>
            </div>
          </div>
        )}

        {/* Table */}
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
              {maintenances.map((maintenance) => {
                const forklift = getForklift(maintenance.forkliftId);
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
                          <p className="font-medium">{forklift?.placa}</p>
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
                      {format(new Date(maintenance.dataAgendada), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {maintenance.custo 
                        ? `R$ ${maintenance.custo.toLocaleString('pt-BR')}` 
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
      </div>
    </MainLayout>
  );
};

export default Manutencoes;
