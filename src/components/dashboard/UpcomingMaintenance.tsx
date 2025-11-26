import { Badge } from '@/components/ui/badge';
import { Maintenance, Forklift } from '@/types/forklift';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface UpcomingMaintenanceProps {
  maintenances: Maintenance[];
  forklifts: Forklift[];
}

const statusConfig = {
  agendada: { label: 'Agendada', variant: 'info' as const, icon: Clock },
  em_andamento: { label: 'Em Andamento', variant: 'warning' as const, icon: AlertCircle },
  concluida: { label: 'Concluída', variant: 'success' as const, icon: CheckCircle2 },
};

export function UpcomingMaintenance({ maintenances, forklifts }: UpcomingMaintenanceProps) {
  const getForklift = (id: string) => forklifts.find(f => f.id === id);

  const pendingMaintenances = maintenances
    .filter(m => m.status !== 'concluida')
    .slice(0, 4);

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Manutenções Pendentes</h3>
      <div className="space-y-4">
        {pendingMaintenances.map((maintenance) => {
          const forklift = getForklift(maintenance.forkliftId);
          const config = statusConfig[maintenance.status];
          const StatusIcon = config.icon;
          
          return (
            <div
              key={maintenance.id}
              className="flex items-start gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-secondary/50"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                maintenance.status === 'em_andamento' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
              }`}>
                <StatusIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{forklift?.placa}</p>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {maintenance.descricao}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  📅 {format(new Date(maintenance.dataAgendada), "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
