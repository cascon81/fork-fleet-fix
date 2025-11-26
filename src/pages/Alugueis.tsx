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
import { rentals, forklifts } from '@/data/mockData';
import { Plus, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  ativo: { label: 'Ativo', variant: 'success' as const },
  finalizado: { label: 'Finalizado', variant: 'secondary' as const },
  atrasado: { label: 'Atrasado', variant: 'destructive' as const },
};

const Alugueis = () => {
  const getForklift = (id: string) => forklifts.find(f => f.id === id);

  const activeRentals = rentals.filter(r => r.status === 'ativo' || r.status === 'atrasado');
  const totalRevenue = activeRentals.reduce((sum, r) => {
    const days = Math.ceil(
      (new Date(r.dataFim).getTime() - new Date(r.dataInicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (r.valorDiaria * days);
  }, 0);

  return (
    <MainLayout title="Gestão de Aluguéis">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Gerencie todos os contratos de aluguel
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Aluguel
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de Contratos</p>
            <p className="text-2xl font-bold text-foreground">{rentals.length}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Ativos</p>
            <p className="text-2xl font-bold text-success">
              {rentals.filter(r => r.status === 'ativo').length}
            </p>
          </div>
          <div className="rounded-lg border bg-destructive/10 border-destructive/20 p-4">
            <p className="text-sm text-muted-foreground">Atrasados</p>
            <p className="text-2xl font-bold text-destructive">
              {rentals.filter(r => r.status === 'atrasado').length}
            </p>
          </div>
          <div className="rounded-lg border bg-primary/10 border-primary/20 p-4">
            <p className="text-sm text-muted-foreground">Receita Estimada</p>
            <p className="text-2xl font-bold text-primary">
              R$ {totalRevenue.toLocaleString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Table */}
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
              {rentals.map((rental) => {
                const forklift = getForklift(rental.forkliftId);
                const config = statusConfig[rental.status];
                
                return (
                  <TableRow key={rental.id} className="hover:bg-secondary/30">
                    <TableCell className="font-medium">{rental.cliente}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{forklift?.placa}</p>
                        <p className="text-sm text-muted-foreground">
                          {forklift?.marca} {forklift?.modelo}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(rental.dataInicio), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(rental.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>R$ {rental.valorDiaria.toLocaleString('pt-BR')}</TableCell>
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

export default Alugueis;
