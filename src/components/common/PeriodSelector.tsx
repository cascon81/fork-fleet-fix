import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PeriodType = 'month' | 'quarter' | 'year';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (period: PeriodType) => void;
  className?: string;
}

const periodLabels: Record<PeriodType, string> = {
  month: 'Mensal',
  quarter: 'Trimestral',
  year: 'Anual',
};

export function PeriodSelector({ value, onChange, className }: PeriodSelectorProps) {
  return (
    <div className={cn('flex items-center gap-1 rounded-lg bg-muted p-1', className)}>
      {(Object.keys(periodLabels) as PeriodType[]).map((period) => (
        <Button
          key={period}
          variant={value === period ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onChange(period)}
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
    </div>
  );
}
