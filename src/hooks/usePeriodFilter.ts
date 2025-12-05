import { useState, useMemo } from 'react';
import type { PeriodType } from '@/components/common/PeriodSelector';

interface PeriodRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  label: string;
}

export function usePeriodFilter(initialPeriod: PeriodType = 'month') {
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);

  const dateRange = useMemo((): PeriodRange => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    let start: Date;
    let end: Date;
    let previousStart: Date;
    let previousEnd: Date;
    let label: string;

    switch (period) {
      case 'month':
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        previousStart = new Date(currentYear, currentMonth - 1, 1);
        previousEnd = new Date(currentYear, currentMonth, 0);
        label = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        break;

      case 'quarter':
        start = new Date(currentYear, currentQuarter * 3, 1);
        end = new Date(currentYear, (currentQuarter + 1) * 3, 0);
        previousStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
        previousEnd = new Date(currentYear, currentQuarter * 3, 0);
        label = `${currentQuarter + 1}º Trimestre ${currentYear}`;
        break;

      case 'year':
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 11, 31);
        previousStart = new Date(currentYear - 1, 0, 1);
        previousEnd = new Date(currentYear - 1, 11, 31);
        label = `Ano ${currentYear}`;
        break;

      default:
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        previousStart = new Date(currentYear, currentMonth - 1, 1);
        previousEnd = new Date(currentYear, currentMonth, 0);
        label = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }

    return { start, end, previousStart, previousEnd, label };
  }, [period]);

  const isInPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= dateRange.start && date <= dateRange.end;
  };

  const isInPreviousPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    return date >= dateRange.previousStart && date <= dateRange.previousEnd;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case 'month': return 'vs mês anterior';
      case 'quarter': return 'vs trimestre anterior';
      case 'year': return 'vs ano anterior';
      default: return 'vs período anterior';
    }
  };

  return {
    period,
    setPeriod,
    dateRange,
    isInPeriod,
    isInPreviousPeriod,
    getPeriodLabel,
  };
}
