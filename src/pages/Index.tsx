import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ForkliftStatusChart } from '@/components/dashboard/ForkliftStatusChart';
import { RecentRentals } from '@/components/dashboard/RecentRentals';
import { UpcomingMaintenance } from '@/components/dashboard/UpcomingMaintenance';
import { forklifts, rentals, maintenances } from '@/data/mockData';
import { Truck, FileCheck, Wrench, DollarSign } from 'lucide-react';

const Index = () => {
  const totalForklifts = forklifts.length;
  const availableForklifts = forklifts.filter(f => f.status === 'disponivel').length;
  const rentedForklifts = forklifts.filter(f => f.status === 'alugada').length;
  const maintenanceForklifts = forklifts.filter(f => f.status === 'manutencao').length;

  const activeRentals = rentals.filter(r => r.status === 'ativo' || r.status === 'atrasado');
  const monthlyRevenue = activeRentals.reduce((sum, r) => {
    const days = Math.ceil(
      (new Date(r.dataFim).getTime() - new Date(r.dataInicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (r.valorDiaria * days);
  }, 0);

  const statusChartData = [
    { name: 'Disponíveis', value: availableForklifts, color: 'hsl(142, 76%, 36%)' },
    { name: 'Alugadas', value: rentedForklifts, color: 'hsl(217, 91%, 60%)' },
    { name: 'Manutenção', value: maintenanceForklifts, color: 'hsl(38, 92%, 50%)' },
  ];

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total da Frota"
            value={totalForklifts}
            icon={Truck}
            variant="primary"
          />
          <StatCard
            title="Disponíveis"
            value={availableForklifts}
            icon={Truck}
            variant="success"
          />
          <StatCard
            title="Aluguéis Ativos"
            value={activeRentals.length}
            icon={FileCheck}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Receita Mensal"
            value={`R$ ${monthlyRevenue.toLocaleString('pt-BR')}`}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ForkliftStatusChart data={statusChartData} />
          <RecentRentals rentals={rentals} forklifts={forklifts} />
        </div>

        {/* Upcoming Maintenance */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingMaintenance maintenances={maintenances} forklifts={forklifts} />
          
          {/* Quick Stats */}
          <div className="rounded-xl border bg-card p-6 shadow-card animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">Alertas</h3>
            <div className="space-y-3">
              {maintenanceForklifts > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-warning/10 p-4 border border-warning/20">
                  <Wrench className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">{maintenanceForklifts} empilhadeira(s) em manutenção</p>
                    <p className="text-sm text-muted-foreground">Verifique o status das manutenções</p>
                  </div>
                </div>
              )}
              {rentals.filter(r => r.status === 'atrasado').length > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                  <FileCheck className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">
                      {rentals.filter(r => r.status === 'atrasado').length} aluguel(éis) atrasado(s)
                    </p>
                    <p className="text-sm text-muted-foreground">Entre em contato com os clientes</p>
                  </div>
                </div>
              )}
              {maintenanceForklifts === 0 && rentals.filter(r => r.status === 'atrasado').length === 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-success/10 p-4 border border-success/20">
                  <FileCheck className="h-5 w-5 text-success" />
                  <div>
                    <p className="font-medium text-foreground">Tudo em dia!</p>
                    <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
