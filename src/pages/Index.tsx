import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ForkliftStatusChart } from '@/components/dashboard/ForkliftStatusChart';
import { RecentRentals } from '@/components/dashboard/RecentRentals';
import { UpcomingMaintenance } from '@/components/dashboard/UpcomingMaintenance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Container, FileCheck, Wrench, DollarSign, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DbForklift = Tables<'forklifts'>;
type DbRental = Tables<'rentals'>;
type DbMaintenance = Tables<'maintenances'>;

const Index = () => {
  const { user } = useAuth();
  const [forklifts, setForklifts] = useState<DbForklift[]>([]);
  const [rentals, setRentals] = useState<DbRental[]>([]);
  const [maintenances, setMaintenances] = useState<DbMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [forkliftsRes, rentalsRes, maintenancesRes] = await Promise.all([
        supabase.from('forklifts').select('*'),
        supabase.from('rentals').select('*'),
        supabase.from('maintenances').select('*'),
      ]);

      if (forkliftsRes.error) throw forkliftsRes.error;
      if (rentalsRes.error) throw rentalsRes.error;
      if (maintenancesRes.error) throw maintenancesRes.error;

      setForklifts(forkliftsRes.data || []);
      setRentals(rentalsRes.data || []);
      setMaintenances(maintenancesRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar dados',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalForklifts = forklifts.length;
  const availableForklifts = forklifts.filter(f => f.status === 'disponivel').length;
  const rentedForklifts = forklifts.filter(f => f.status === 'alugada').length;
  const maintenanceForklifts = forklifts.filter(f => f.status === 'manutencao').length;

  const activeRentals = rentals.filter(r => r.status === 'ativo' || r.status === 'atrasado');
  const monthlyRevenue = activeRentals.reduce((sum, r) => {
    const days = Math.ceil(
      (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (Number(r.valor_diaria) * days);
  }, 0);

  const statusChartData = [
    { name: 'Disponíveis', value: availableForklifts, color: 'hsl(142, 76%, 36%)' },
    { name: 'Alugadas', value: rentedForklifts, color: 'hsl(217, 91%, 60%)' },
    { name: 'Manutenção', value: maintenanceForklifts, color: 'hsl(38, 92%, 50%)' },
  ];

  // Adaptar dados para componentes que esperam o formato antigo
  const adaptedForklifts = forklifts.map(f => ({
    id: f.id,
    placa: f.placa,
    marca: f.marca,
    modelo: f.modelo,
    capacidade: f.capacidade,
    anoFabricacao: f.ano_fabricacao,
    horasUso: f.horas_uso,
    status: f.status,
    ultimaManutencao: f.ultima_manutencao,
    proximaManutencao: f.proxima_manutencao,
  }));

  const adaptedRentals = rentals.map(r => ({
    id: r.id,
    forkliftId: r.forklift_id,
    cliente: r.cliente,
    dataInicio: r.data_inicio,
    dataFim: r.data_fim,
    valorDiaria: Number(r.valor_diaria),
    status: r.status,
  }));

  const adaptedMaintenances = maintenances.map(m => ({
    id: m.id,
    forkliftId: m.forklift_id,
    tipo: m.tipo,
    descricao: m.descricao,
    dataAgendada: m.data_agendada,
    dataConclusao: m.data_conclusao,
    custo: m.custo ? Number(m.custo) : undefined,
    status: m.status,
  }));

  const overdueRentals = rentals.filter(r => r.status === 'atrasado').length;

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total da Frota"
            value={totalForklifts}
            icon={Container}
            variant="primary"
          />
          <StatCard
            title="Disponíveis"
            value={availableForklifts}
            icon={Container}
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
          <RecentRentals rentals={adaptedRentals} forklifts={adaptedForklifts} />
        </div>

        {/* Upcoming Maintenance */}
        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingMaintenance maintenances={adaptedMaintenances} forklifts={adaptedForklifts} />
          
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
              {overdueRentals > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 border border-destructive/20">
                  <FileCheck className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-foreground">
                      {overdueRentals} aluguel(éis) atrasado(s)
                    </p>
                    <p className="text-sm text-muted-foreground">Entre em contato com os clientes</p>
                  </div>
                </div>
              )}
              {maintenanceForklifts === 0 && overdueRentals === 0 && (
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
