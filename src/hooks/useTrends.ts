import { useMemo } from 'react';
import type { Tables } from '@/integrations/supabase/types';
import type { PeriodType, CustomDateRange } from '@/components/common/PeriodSelector';

type DbForklift = Tables<'forklifts'>;
type DbRental = Tables<'rentals'>;

interface PeriodRange {
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
}

interface TrendsResult {
  utilizationTrend: number;
  revenueTrend: number;
  rentalsTrend: number;
  currentRevenue: number;
  previousRevenue: number;
  currentRentalsCount: number;
  previousRentalsCount: number;
}

const getPeriodRange = (period: PeriodType, customRange?: CustomDateRange): PeriodRange => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);

  switch (period) {
    case 'month':
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0),
        previousStart: new Date(currentYear, currentMonth - 1, 1),
        previousEnd: new Date(currentYear, currentMonth, 0),
      };

    case 'quarter':
      return {
        start: new Date(currentYear, currentQuarter * 3, 1),
        end: new Date(currentYear, (currentQuarter + 1) * 3, 0),
        previousStart: new Date(currentYear, (currentQuarter - 1) * 3, 1),
        previousEnd: new Date(currentYear, currentQuarter * 3, 0),
      };

    case 'year':
      return {
        start: new Date(currentYear, 0, 1),
        end: new Date(currentYear, 11, 31),
        previousStart: new Date(currentYear - 1, 0, 1),
        previousEnd: new Date(currentYear - 1, 11, 31),
      };

    case 'custom':
      if (customRange?.from && customRange?.to) {
        const start = customRange.from;
        const end = customRange.to;
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return {
          start,
          end,
          previousStart: new Date(start.getTime() - (days + 1) * 24 * 60 * 60 * 1000),
          previousEnd: new Date(start.getTime() - 24 * 60 * 60 * 1000),
        };
      }
      // Fallback to month if custom range not set
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0),
        previousStart: new Date(currentYear, currentMonth - 1, 1),
        previousEnd: new Date(currentYear, currentMonth, 0),
      };

    default:
      return {
        start: new Date(currentYear, currentMonth, 1),
        end: new Date(currentYear, currentMonth + 1, 0),
        previousStart: new Date(currentYear, currentMonth - 1, 1),
        previousEnd: new Date(currentYear, currentMonth, 0),
      };
  }
};

export const useTrends = (
  forklifts: DbForklift[],
  rentals: DbRental[],
  period: PeriodType = 'month',
  customRange?: CustomDateRange
): TrendsResult => {
  return useMemo(() => {
    const range = getPeriodRange(period, customRange);

    // Filter rentals by period (rental is in period if it overlaps)
    const isInRange = (rental: DbRental, start: Date, end: Date) => {
      const rentalStart = new Date(rental.data_inicio);
      const rentalEnd = new Date(rental.data_fim);
      return rentalStart <= end && rentalEnd >= start;
    };

    const currentPeriodRentals = rentals.filter(r => isInRange(r, range.start, range.end));
    const previousPeriodRentals = rentals.filter(r => isInRange(r, range.previousStart, range.previousEnd));

    // Calculate revenue for a period
    const calculateRevenue = (periodRentals: DbRental[], start: Date, end: Date) => {
      return periodRentals.reduce((sum, r) => {
        const rentalStart = new Date(r.data_inicio);
        const rentalEnd = new Date(r.data_fim);
        
        // Calculate days within the period
        const effectiveStart = rentalStart < start ? start : rentalStart;
        const effectiveEnd = rentalEnd > end ? end : rentalEnd;
        const days = Math.ceil(
          (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
        
        return sum + (Number(r.valor_diaria) * Math.max(days, 1));
      }, 0);
    };

    const currentRevenue = calculateRevenue(currentPeriodRentals, range.start, range.end);
    const previousRevenue = calculateRevenue(previousPeriodRentals, range.previousStart, range.previousEnd);

    // Calculate trends
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const revenueTrend = calculateTrend(currentRevenue, previousRevenue);
    const rentalsTrend = calculateTrend(currentPeriodRentals.length, previousPeriodRentals.length);

    // Utilization trend
    const currentUtilization = forklifts.length > 0
      ? (forklifts.filter(f => f.status === 'alugada').length / forklifts.length) * 100
      : 0;

    const prevEstimatedUtilization = forklifts.length > 0 && previousPeriodRentals.length > 0
      ? Math.min(((previousPeriodRentals.length / forklifts.length) * 100), 100)
      : currentUtilization;

    const utilizationTrend = calculateTrend(currentUtilization, prevEstimatedUtilization || currentUtilization);

    return {
      utilizationTrend: Math.round(utilizationTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      rentalsTrend: Math.round(rentalsTrend * 10) / 10,
      currentRevenue: Math.round(currentRevenue),
      previousRevenue: Math.round(previousRevenue),
      currentRentalsCount: currentPeriodRentals.length,
      previousRentalsCount: previousPeriodRentals.length,
    };
  }, [forklifts, rentals, period, customRange]);
};
