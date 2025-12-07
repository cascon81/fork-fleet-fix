import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type DbRental = Tables<'rentals'>;

interface PeriodComparisonChartProps {
  rentals: DbRental[];
}

type CompareMode = 'quarter' | 'year';

interface QuarterOption {
  label: string;
  year: number;
  quarter: number;
}

interface YearOption {
  label: string;
  year: number;
}

export function PeriodComparisonChart({ rentals }: PeriodComparisonChartProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('quarter');
  const [selectedPeriod1, setSelectedPeriod1] = useState<string>('');
  const [selectedPeriod2, setSelectedPeriod2] = useState<string>('');

  // Generate available quarters and years from rentals
  const { quarters, years } = useMemo(() => {
    const quartersSet = new Set<string>();
    const yearsSet = new Set<number>();

    rentals.forEach(rental => {
      const date = new Date(rental.data_inicio);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      
      quartersSet.add(`${year}-Q${quarter}`);
      yearsSet.add(year);
    });

    const quartersArr: QuarterOption[] = Array.from(quartersSet)
      .map(q => {
        const [year, qPart] = q.split('-Q');
        return {
          label: `Q${qPart} ${year}`,
          year: parseInt(year),
          quarter: parseInt(qPart),
        };
      })
      .sort((a, b) => b.year - a.year || b.quarter - a.quarter);

    const yearsArr: YearOption[] = Array.from(yearsSet)
      .map(y => ({ label: `${y}`, year: y }))
      .sort((a, b) => b.year - a.year);

    return { quarters: quartersArr, years: yearsArr };
  }, [rentals]);

  // Set default selections
  useMemo(() => {
    if (compareMode === 'quarter' && quarters.length >= 2 && !selectedPeriod1) {
      setSelectedPeriod1(`${quarters[0].year}-Q${quarters[0].quarter}`);
      setSelectedPeriod2(`${quarters[1].year}-Q${quarters[1].quarter}`);
    } else if (compareMode === 'year' && years.length >= 2 && !selectedPeriod1) {
      setSelectedPeriod1(`${years[0].year}`);
      setSelectedPeriod2(`${years[1].year}`);
    }
  }, [compareMode, quarters, years, selectedPeriod1]);

  // Calculate metrics for comparison
  const comparisonData = useMemo(() => {
    if (!selectedPeriod1 || !selectedPeriod2) return null;

    const getRevenueForPeriod = (periodKey: string): number => {
      return rentals
        .filter(rental => {
          const date = new Date(rental.data_inicio);
          const year = date.getFullYear();
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          
          if (compareMode === 'quarter') {
            return `${year}-Q${quarter}` === periodKey;
          } else {
            return `${year}` === periodKey;
          }
        })
        .reduce((sum, r) => {
          const days = Math.ceil(
            (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
          ) + 1;
          return sum + (Number(r.valor_diaria) * Math.max(days, 1));
        }, 0);
    };

    const getRentalsCountForPeriod = (periodKey: string): number => {
      return rentals.filter(rental => {
        const date = new Date(rental.data_inicio);
        const year = date.getFullYear();
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        
        if (compareMode === 'quarter') {
          return `${year}-Q${quarter}` === periodKey;
        } else {
          return `${year}` === periodKey;
        }
      }).length;
    };

    const revenue1 = getRevenueForPeriod(selectedPeriod1);
    const revenue2 = getRevenueForPeriod(selectedPeriod2);
    const rentals1 = getRentalsCountForPeriod(selectedPeriod1);
    const rentals2 = getRentalsCountForPeriod(selectedPeriod2);

    const label1 = compareMode === 'quarter'
      ? `Q${selectedPeriod1.split('-Q')[1]} ${selectedPeriod1.split('-Q')[0]}`
      : selectedPeriod1;
    const label2 = compareMode === 'quarter'
      ? `Q${selectedPeriod2.split('-Q')[1]} ${selectedPeriod2.split('-Q')[0]}`
      : selectedPeriod2;

    return {
      chartData: [
        { metric: 'Receita (R$ mil)', [label1]: revenue1 / 1000, [label2]: revenue2 / 1000 },
        { metric: 'Aluguéis', [label1]: rentals1, [label2]: rentals2 },
      ],
      summary: {
        revenue1,
        revenue2,
        rentals1,
        rentals2,
        revenueChange: revenue2 > 0 ? ((revenue1 - revenue2) / revenue2) * 100 : 0,
        rentalsChange: rentals2 > 0 ? ((rentals1 - rentals2) / rentals2) * 100 : 0,
        label1,
        label2,
      },
    };
  }, [rentals, selectedPeriod1, selectedPeriod2, compareMode]);

  const handleModeChange = (mode: CompareMode) => {
    setCompareMode(mode);
    setSelectedPeriod1('');
    setSelectedPeriod2('');
  };

  const options = compareMode === 'quarter' 
    ? quarters.map(q => ({ value: `${q.year}-Q${q.quarter}`, label: q.label }))
    : years.map(y => ({ value: `${y.year}`, label: y.label }));

  if (rentals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Períodos</CardTitle>
          <CardDescription>Compare receita e aluguéis entre diferentes períodos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Nenhum dado disponível para comparação
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Comparação de Períodos</CardTitle>
            <CardDescription>Compare receita e aluguéis entre diferentes períodos</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={compareMode === 'quarter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('quarter')}
            >
              Trimestres
            </Button>
            <Button
              variant={compareMode === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleModeChange('year')}
            >
              Anos
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Período 1
            </label>
            <Select value={selectedPeriod1} onValueChange={setSelectedPeriod1}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Período 2
            </label>
            <Select value={selectedPeriod2} onValueChange={setSelectedPeriod2}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar período" />
              </SelectTrigger>
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {comparisonData && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Variação Receita</p>
                <div className={`flex items-center gap-2 mt-1 ${
                  comparisonData.summary.revenueChange >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {comparisonData.summary.revenueChange >= 0 
                    ? <TrendingUp className="h-5 w-5" /> 
                    : <TrendingDown className="h-5 w-5" />
                  }
                  <span className="text-2xl font-bold">
                    {comparisonData.summary.revenueChange >= 0 ? '+' : ''}
                    {comparisonData.summary.revenueChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparisonData.summary.label1} vs {comparisonData.summary.label2}
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Variação Aluguéis</p>
                <div className={`flex items-center gap-2 mt-1 ${
                  comparisonData.summary.rentalsChange >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {comparisonData.summary.rentalsChange >= 0 
                    ? <TrendingUp className="h-5 w-5" /> 
                    : <TrendingDown className="h-5 w-5" />
                  }
                  <span className="text-2xl font-bold">
                    {comparisonData.summary.rentalsChange >= 0 ? '+' : ''}
                    {comparisonData.summary.rentalsChange.toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {comparisonData.summary.label1} vs {comparisonData.summary.label2}
                </p>
              </div>
            </div>

            {/* Detailed Numbers */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">{comparisonData.summary.label1}</p>
                <p className="text-lg font-bold">
                  R$ {comparisonData.summary.revenue1.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {comparisonData.summary.rentals1} aluguéis
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm font-medium mb-2">{comparisonData.summary.label2}</p>
                <p className="text-lg font-bold">
                  R$ {comparisonData.summary.revenue2.toLocaleString('pt-BR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {comparisonData.summary.rentals2} aluguéis
                </p>
              </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={comparisonData.chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey={comparisonData.summary.label1} 
                  fill="hsl(210, 100%, 45%)" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey={comparisonData.summary.label2} 
                  fill="hsl(142, 76%, 36%)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
