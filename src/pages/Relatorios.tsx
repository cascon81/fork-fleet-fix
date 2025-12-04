import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useTrends } from '@/hooks/useTrends';
import { generateReportPDF } from '@/lib/generateReportPDF';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DbForklift = Tables<'forklifts'>;
type DbRental = Tables<'rentals'>;
type DbMaintenance = Tables<'maintenances'>;

const Relatorios = () => {
  const { user } = useAuth();
  const [forklifts, setForklifts] = useState<DbForklift[]>([]);
  const [rentals, setRentals] = useState<DbRental[]>([]);
  const [maintenances, setMaintenances] = useState<DbMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const trends = useTrends(forklifts, rentals);

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

  // Calcular receita mensal
  const activeRentals = rentals.filter(r => r.status === 'ativo' || r.status === 'atrasado');
  const monthlyRevenue = activeRentals.reduce((sum, r) => {
    const days = Math.ceil(
      (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    return sum + (Number(r.valor_diaria) * Math.max(days, 1));
  }, 0);

  // Taxa de utilização
  const utilizationRate = forklifts.length > 0 
    ? Math.round((forklifts.filter(f => f.status === 'alugada').length / forklifts.length) * 100) 
    : 0;

  // Ticket médio
  const averageTicket = activeRentals.length > 0
    ? Math.round(activeRentals.reduce((sum, r) => sum + Number(r.valor_diaria), 0) / activeRentals.length)
    : 0;

  // Custo de manutenção
  const maintenanceCost = maintenances.reduce((sum, m) => sum + (Number(m.custo) || 0), 0);

  // Dados para gráficos
  const statusData = [
    { name: 'Disponíveis', value: forklifts.filter(f => f.status === 'disponivel').length },
    { name: 'Alugadas', value: forklifts.filter(f => f.status === 'alugada').length },
    { name: 'Manutenção', value: forklifts.filter(f => f.status === 'manutencao').length },
  ];

  const COLORS = ['hsl(142, 76%, 36%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)'];

  // Receita por mês
  const revenueByMonth = rentals.reduce((acc, rental) => {
    const month = new Date(rental.data_inicio).toLocaleDateString('pt-BR', { month: 'short' });
    const days = Math.ceil(
      (new Date(rental.data_fim).getTime() - new Date(rental.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
    );
    const value = Number(rental.valor_diaria) * Math.max(days, 1);
    
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.receita += value;
    } else {
      acc.push({ month, receita: value });
    }
    return acc;
  }, [] as { month: string; receita: number }[]);

  // Manutenções por tipo
  const maintenanceData = [
    { tipo: 'Preventivas', count: maintenances.filter(m => m.tipo === 'preventiva').length },
    { tipo: 'Corretivas', count: maintenances.filter(m => m.tipo === 'corretiva').length },
  ];

  // Utilização da frota por marca
  const brandUsage = forklifts.reduce((acc, forklift) => {
    const existing = acc.find(item => item.marca === forklift.marca);
    if (existing) {
      existing.quantidade++;
    } else {
      acc.push({ marca: forklift.marca, quantidade: 1 });
    }
    return acc;
  }, [] as { marca: string; quantidade: number }[]);

  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(1)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const handleExportPDF = () => {
    generateReportPDF({
      utilizationRate,
      monthlyRevenue,
      averageTicket,
      maintenanceCost,
      forkliftsTotal: forklifts.length,
      forkliftsAvailable: forklifts.filter(f => f.status === 'disponivel').length,
      forkliftsRented: forklifts.filter(f => f.status === 'alugada').length,
      forkliftsMaintenance: forklifts.filter(f => f.status === 'manutencao').length,
      activeRentals: activeRentals.length,
      totalRentals: rentals.length,
      preventiveMaintenances: maintenances.filter(m => m.tipo === 'preventiva').length,
      correctiveMaintenances: maintenances.filter(m => m.tipo === 'corretiva').length,
      trends: {
        utilizationTrend: trends.utilizationTrend,
        revenueTrend: trends.revenueTrend,
      },
    });
    toast({
      title: 'Relatório exportado',
      description: 'O PDF foi gerado e baixado com sucesso.',
    });
  };

  const TrendIndicator = ({ value, label }: { value: number; label: string }) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center gap-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{isPositive ? '+' : ''}{value.toFixed(1)}% {label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout title="Relatórios e Análises">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Relatórios e Análises">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">
              Visualize métricas e análises detalhadas da sua frota
            </p>
          </div>
          <Button className="gap-2" onClick={handleExportPDF}>
            <Download className="h-4 w-4" />
            Exportar Relatório PDF
          </Button>
        </div>

        {/* KPIs Principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taxa de Utilização</CardDescription>
              <CardTitle className="text-3xl">{utilizationRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendIndicator value={trends.utilizationTrend} label="vs mês anterior" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receita Mensal</CardDescription>
              <CardTitle className="text-3xl">{formatCurrency(monthlyRevenue)}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendIndicator value={trends.revenueTrend} label="vs mês anterior" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ticket Médio</CardDescription>
              <CardTitle className="text-3xl">R$ {averageTicket.toLocaleString('pt-BR')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>por diária</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Custo Manutenção</CardDescription>
              <CardTitle className="text-3xl">{formatCurrency(maintenanceCost)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>total registrado</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status da Frota */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição da Frota</CardTitle>
              <CardDescription>Status atual de todas as empilhadeiras</CardDescription>
            </CardHeader>
            <CardContent>
              {forklifts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhuma empilhadeira cadastrada
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evolução da Receita */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>Por mês de início do aluguel</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="receita" 
                      stroke="hsl(210, 100%, 45%)" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(210, 100%, 45%)', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum aluguel registrado
                </div>
              )}
            </CardContent>
          </Card>

          {/* Frota por Marca */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Marca</CardTitle>
              <CardDescription>Quantidade de empilhadeiras por fabricante</CardDescription>
            </CardHeader>
            <CardContent>
              {brandUsage.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={brandUsage}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="marca" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="hsl(200, 85%, 60%)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhuma empilhadeira cadastrada
                </div>
              )}
            </CardContent>
          </Card>

          {/* Manutenções */}
          <Card>
            <CardHeader>
              <CardTitle>Manutenções por Tipo</CardTitle>
              <CardDescription>Distribuição de preventivas vs corretivas</CardDescription>
            </CardHeader>
            <CardContent>
              {maintenances.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="tipo" type="category" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhuma manutenção registrada
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights e Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
            <CardDescription>Análise automática baseada nos dados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {forklifts.length > 0 && utilizationRate >= 50 && (
                <div className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Alta taxa de utilização</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sua frota está com {utilizationRate}% de utilização. 
                      Considere expandir a frota para atender mais demanda.
                    </p>
                  </div>
                </div>
              )}

              {maintenances.filter(m => m.tipo === 'preventiva' && m.status === 'agendada').length > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-warning/10 border border-warning/20 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning/20">
                    <Calendar className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Manutenções preventivas agendadas</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {maintenances.filter(m => m.tipo === 'preventiva' && m.status === 'agendada').length} manutenções 
                      preventivas programadas. Isso ajuda a reduzir custos com corretivas.
                    </p>
                  </div>
                </div>
              )}

              {forklifts.length === 0 && rentals.length === 0 && maintenances.length === 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-muted/50 border border-border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Comece a registrar dados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cadastre empilhadeiras, aluguéis e manutenções para ver insights detalhados aqui.
                    </p>
                  </div>
                </div>
              )}

              {rentals.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg bg-info/10 border border-info/20 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/20">
                    <BarChart className="h-4 w-4 text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Acompanhe sua receita</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você tem {rentals.length} aluguel(éis) registrado(s) com receita estimada de R$ {monthlyRevenue.toLocaleString('pt-BR')}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
