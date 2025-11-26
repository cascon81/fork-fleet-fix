import { Forklift } from '@/types/forklift';
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
import { Eye, Edit, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ForkliftTableProps {
  forklifts: Forklift[];
}

const statusConfig = {
  disponivel: { label: 'Disponível', variant: 'success' as const },
  alugada: { label: 'Alugada', variant: 'info' as const },
  manutencao: { label: 'Manutenção', variant: 'warning' as const },
};

export function ForkliftTable({ forklifts }: ForkliftTableProps) {
  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/50 hover:bg-secondary/50">
            <TableHead className="font-semibold">Placa</TableHead>
            <TableHead className="font-semibold">Marca / Modelo</TableHead>
            <TableHead className="font-semibold">Capacidade</TableHead>
            <TableHead className="font-semibold">Ano</TableHead>
            <TableHead className="font-semibold">Horas Uso</TableHead>
            <TableHead className="font-semibold">Próx. Manutenção</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forklifts.map((forklift) => {
            const config = statusConfig[forklift.status];
            
            return (
              <TableRow key={forklift.id} className="hover:bg-secondary/30">
                <TableCell className="font-medium">{forklift.placa}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{forklift.marca}</p>
                    <p className="text-sm text-muted-foreground">{forklift.modelo}</p>
                  </div>
                </TableCell>
                <TableCell>{forklift.capacidade}</TableCell>
                <TableCell>{forklift.anoFabricacao}</TableCell>
                <TableCell>{forklift.horasUso.toLocaleString('pt-BR')}h</TableCell>
                <TableCell>
                  {format(new Date(forklift.proximaManutencao), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
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
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
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
  );
}
