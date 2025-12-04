import { useMemo } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type DbForklift = Tables<'forklifts'>;
type DbRental = Tables<'rentals'>;

interface TrendsResult {
  utilizationTrend: number;
  revenueTrend: number;
  rentalsTrend: number;
}

export const useTrends = (
  forklifts: DbForklift[],
  rentals: DbRental[]
): TrendsResult => {
  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Filter rentals by month
    const isInMonth = (dateStr: string, month: number, year: number) => {
      const date = new Date(dateStr);
      return date.getMonth() === month && date.getFullYear() === year;
    };
    
    const currentMonthRentals = rentals.filter(r => 
      isInMonth(r.data_inicio, currentMonth, currentYear) ||
      (new Date(r.data_inicio) <= now && new Date(r.data_fim) >= new Date(currentYear, currentMonth, 1))
    );
    
    const prevMonthRentals = rentals.filter(r => 
      isInMonth(r.data_inicio, prevMonth, prevYear) ||
      (new Date(r.data_inicio) <= new Date(prevYear, prevMonth + 1, 0) && 
       new Date(r.data_fim) >= new Date(prevYear, prevMonth, 1))
    );
    
    // Calculate revenue for each month
    const calculateRevenue = (monthRentals: DbRental[]) => {
      return monthRentals.reduce((sum, r) => {
        const days = Math.ceil(
          (new Date(r.data_fim).getTime() - new Date(r.data_inicio).getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + (Number(r.valor_diaria) * Math.max(days, 1));
      }, 0);
    };
    
    const currentRevenue = calculateRevenue(currentMonthRentals);
    const prevRevenue = calculateRevenue(prevMonthRentals);
    
    // Calculate trends
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const revenueTrend = calculateTrend(currentRevenue, prevRevenue);
    const rentalsTrend = calculateTrend(currentMonthRentals.length, prevMonthRentals.length);
    
    // Utilization trend (based on current rented vs historical average)
    const currentUtilization = forklifts.length > 0 
      ? (forklifts.filter(f => f.status === 'alugada').length / forklifts.length) * 100 
      : 0;
    
    // Estimate previous utilization based on rental patterns
    const avgRentalsPerMonth = rentals.length > 0 ? rentals.length / 12 : 0;
    const prevEstimatedUtilization = forklifts.length > 0 && avgRentalsPerMonth > 0
      ? Math.min(((prevMonthRentals.length / forklifts.length) * 100), 100)
      : currentUtilization;
    
    const utilizationTrend = calculateTrend(currentUtilization, prevEstimatedUtilization || currentUtilization);
    
    return {
      utilizationTrend: Math.round(utilizationTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      rentalsTrend: Math.round(rentalsTrend * 10) / 10,
    };
  }, [forklifts, rentals]);
};
