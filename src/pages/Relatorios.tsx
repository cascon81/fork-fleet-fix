import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { forklifts, rentals, maintenances } from '@/data/mockData';
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
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Download, TrendingUp, Calendar } from 'lucide-react';

const Relatorios = () => {
  // Dados para gráficos
  const statusData = [
    { name: 'Disponíveis', value: forklifts.filter(f => f.status === 'disponivel').length },
    { name: 'Alugadas', value: forklifts.filter(f => f.status === 'alugada').length },
    { name: 'Manutenção', value: forklifts.filter(f => f.status === 'manutencao').length },
  ];

  const COLORS = ['hsl(142, 76%, 36%)', 'hsl(217, 91%, 60%)', 'hsl(38, 92%, 50%)'];

  // Receita por mês (exemplo)
  const revenueData = [
    { month: 'Jul', receita: 35000 },
    { month: 'Ago', receita: 42000 },
    { month: 'Set', receita: 38000 },
    { month: 'Out', receita: 51000 },
    { month: 'Nov', receita: 48000 },
    { month: 'Dez', receita: 55000 },
  ];

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
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Relatório PDF
          </Button>
        </div>

        {/* KPIs Principais */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Taxa de Utilização</CardDescription>
              <CardTitle className="text-3xl">
                {Math.round((forklifts.filter(f => f.status === 'alugada').length / forklifts.length) * 100)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Receita Mensal</CardDescription>
              <CardTitle className="text-3xl">R$ 48k</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+8% vs mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ticket Médio</CardDescription>
              <CardTitle className="text-3xl">R$ 350</CardTitle>
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
              <CardTitle className="text-3xl">R$ 2,9k</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>últimos 30 dias</span>
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
            </CardContent>
          </Card>

          {/* Evolução da Receita */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
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
            </CardContent>
          </Card>

          {/* Frota por Marca */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Marca</CardTitle>
              <CardDescription>Quantidade de empilhadeiras por fabricante</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={brandUsage}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="marca" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="hsl(200, 85%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Manutenções */}
          <Card>
            <CardHeader>
              <CardTitle>Manutenções por Tipo</CardTitle>
              <CardDescription>Distribuição de preventivas vs corretivas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={maintenanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" />
                  <YAxis dataKey="tipo" type="category" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(142, 76%, 36%)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
              <div className="flex items-start gap-3 rounded-lg bg-success/10 border border-success/20 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Alta taxa de utilização</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Sua frota está com {Math.round((forklifts.filter(f => f.status === 'alugada').length / forklifts.length) * 100)}% de utilização. 
                    Considere expandir a frota para atender mais demanda.
                  </p>
                </div>
              </div>

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

              <div className="flex items-start gap-3 rounded-lg bg-info/10 border border-info/20 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/20">
                  <BarChart className="h-4 w-4 text-info" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Crescimento consistente</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    A receita vem crescendo consistentemente nos últimos meses. Continue o bom trabalho!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Relatorios;
