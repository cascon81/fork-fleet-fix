import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { maintenanceSchema } from '@/lib/validations';

interface AddMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaintenanceModal({ open, onOpenChange }: AddMaintenanceModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    forkliftId: '',
    tipo: '',
    descricao: '',
    dataAgendada: '',
    custo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [forklifts, setForklifts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user) {
      fetchForklifts();
    }
  }, [open, user]);

  const fetchForklifts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('forklifts')
      .select('*')
      .eq('user_id', user.id);

    if (!error && data) {
      setForklifts(data);
    }
  };

  const resetForm = () => {
    setFormData({
      forkliftId: '',
      tipo: '',
      descricao: '',
      dataAgendada: '',
      custo: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!user) {
      toast.error('Você precisa estar logado para agendar uma manutenção');
      return;
    }

    const validation = maintenanceSchema.safeParse({
      ...formData,
      custo: formData.custo || undefined,
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('maintenances').insert({
        user_id: user.id,
        forklift_id: formData.forkliftId,
        tipo: formData.tipo as 'preventiva' | 'corretiva',
        descricao: formData.descricao,
        data_agendada: formData.dataAgendada,
        custo: formData.custo ? parseFloat(formData.custo) : null,
        status: 'agendada',
      });

      if (error) throw error;

      const forklift = forklifts.find(f => f.id === formData.forkliftId);
      toast.success('Manutenção agendada com sucesso!', {
        description: `${forklift?.marca} ${forklift?.modelo} - ${formData.tipo}`,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao agendar manutenção', {
        description: 'Tente novamente mais tarde',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Agendar Nova Manutenção</DialogTitle>
          <DialogDescription>
            Registre uma nova manutenção preventiva ou corretiva.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forklift">Empilhadeira *</Label>
              <Select
                value={formData.forkliftId}
                onValueChange={(value) => setFormData({ ...formData, forkliftId: value })}
              >
                <SelectTrigger id="forklift" className={errors.forkliftId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a empilhadeira" />
                </SelectTrigger>
                <SelectContent>
                  {forklifts.map((forklift) => (
                    <SelectItem key={forklift.id} value={forklift.id}>
                      {forklift.placa} - {forklift.marca} {forklift.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.forkliftId && <p className="text-sm text-destructive">{errors.forkliftId}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Manutenção *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo" className={errors.tipo ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-sm text-destructive">{errors.tipo}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição * (máx. 1000 caracteres)</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os serviços a serem realizados..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
                maxLength={1000}
                className={errors.descricao ? 'border-destructive' : ''}
              />
              <p className="text-xs text-muted-foreground">{formData.descricao.length}/1000</p>
              {errors.descricao && <p className="text-sm text-destructive">{errors.descricao}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data Agendada *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataAgendada}
                  onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                  className={errors.dataAgendada ? 'border-destructive' : ''}
                />
                {errors.dataAgendada && <p className="text-sm text-destructive">{errors.dataAgendada}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custo">Custo Estimado (R$)</Label>
                <Input
                  id="custo"
                  type="number"
                  placeholder="0.00"
                  value={formData.custo}
                  onChange={(e) => setFormData({ ...formData, custo: e.target.value })}
                  min="0"
                  step="0.01"
                  className={errors.custo ? 'border-destructive' : ''}
                />
                {errors.custo && <p className="text-sm text-destructive">{errors.custo}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Agendando...' : 'Agendar Manutenção'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
