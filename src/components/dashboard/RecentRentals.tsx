import { Badge } from '@/components/ui/badge';
import { Rental, Forklift } from '@/types/forklift';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RecentRentalsProps {
  rentals: Rental[];
  forklifts: Forklift[];
}

const statusConfig = {
  ativo: { label: 'Ativo', variant: 'success' as const },
  finalizado: { label: 'Finalizado', variant: 'secondary' as const },
  atrasado: { label: 'Atrasado', variant: 'destructive' as const },
};

export function RecentRentals({ rentals, forklifts }: RecentRentalsProps) {
  const getForklift = (id: string) => forklifts.find(f => f.id === id);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Aluguéis Recentes</h3>
      <div className="space-y-4">
        {rentals.slice(0, 4).map((rental) => {
          const forklift = getForklift(rental.forkliftId);
          const config = statusConfig[rental.status];
          
          return (
            <div
              key={rental.id}
              className="flex items-center justify-between rounded-lg border bg-background p-4 transition-colors hover:bg-secondary/50"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{rental.cliente}</p>
                <p className="text-sm text-muted-foreground">
                  {forklift?.marca} {forklift?.modelo} • {forklift?.placa}
                </p>
              </div>
              <div className="text-right">
                <Badge variant={config.variant}>{config.label}</Badge>
                <p className="mt-1 text-sm text-muted-foreground">
                  {format(new Date(rental.dataFim), "dd MMM yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
