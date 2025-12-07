import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

export type PeriodType = 'month' | 'quarter' | 'year' | 'custom';

export interface CustomDateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  customRange?: CustomDateRange;
  onCustomRangeChange?: (range: CustomDateRange) => void;
  className?: string;
}

const periodLabels: Record<PeriodType, string> = {
  month: 'Mensal',
  quarter: 'Trimestral',
  year: 'Anual',
  custom: 'Customizado',
};

export function PeriodSelector({ 
  value, 
  onChange, 
  customRange,
  onCustomRangeChange,
  className 
}: PeriodSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePeriodClick = (period: PeriodType) => {
    if (period === 'custom') {
      setIsCalendarOpen(true);
    }
    onChange(period);
  };

  const formatCustomRange = () => {
    if (customRange?.from && customRange?.to) {
      return `${format(customRange.from, 'dd/MM/yy', { locale: ptBR })} - ${format(customRange.to, 'dd/MM/yy', { locale: ptBR })}`;
    }
    return 'Selecionar datas';
  };

  return (
    <div className={cn('flex items-center gap-1 rounded-lg bg-muted p-1', className)}>
      {(['month', 'quarter', 'year'] as PeriodType[]).map((period) => (
        <Button
          key={period}
          variant={value === period ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handlePeriodClick(period)}
          className={cn(
            'h-8 px-3 text-sm',
            value === period 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {periodLabels[period]}
        </Button>
      ))}
      
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={value === 'custom' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePeriodClick('custom')}
            className={cn(
              'h-8 px-3 text-sm gap-1.5',
              value === 'custom' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {value === 'custom' ? formatCustomRange() : 'Customizado'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ 
              from: customRange?.from, 
              to: customRange?.to 
            }}
            onSelect={(range) => {
              onCustomRangeChange?.({ 
                from: range?.from, 
                to: range?.to 
              });
              if (range?.from && range?.to) {
                setIsCalendarOpen(false);
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
