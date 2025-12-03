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
import { rentalSchema } from '@/lib/validations';

interface AddRentalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddRentalModal({ open, onOpenChange }: AddRentalModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    forkliftId: '',
    cliente: '',
    dataInicio: '',
    dataFim: '',
    valorDiaria: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableForklifts, setAvailableForklifts] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && user) {
      fetchAvailableForklifts();
    }
  }, [open, user]);

  const fetchAvailableForklifts = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('forklifts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'disponivel');

    if (!error && data) {
      setAvailableForklifts(data);
    }
  };

  const resetForm = () => {
    setFormData({
      forkliftId: '',
      cliente: '',
      dataInicio: '',
      dataFim: '',
      valorDiaria: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!user) {
      toast.error('Você precisa estar logado para registrar um aluguel');
      return;
    }

    const validation = rentalSchema.safeParse({
      ...formData,
      valorDiaria: formData.valorDiaria ? parseFloat(formData.valorDiaria) : 0,
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
      const { error: rentalError } = await supabase.from('rentals').insert({
        user_id: user.id,
        forklift_id: formData.forkliftId,
        cliente: formData.cliente,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        valor_diaria: parseFloat(formData.valorDiaria),
        status: 'ativo',
      });

      if (rentalError) throw rentalError;

      const { error: updateError } = await supabase
        .from('forklifts')
        .update({ status: 'alugada' })
        .eq('id', formData.forkliftId);

      if (updateError) throw updateError;

      const forklift = availableForklifts.find((f) => f.id === formData.forkliftId);
      toast.success('Aluguel registrado com sucesso!', {
        description: `${forklift?.marca} ${forklift?.modelo} - ${formData.cliente}`,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao registrar aluguel', {
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
          <DialogTitle>Registrar Novo Aluguel</DialogTitle>
          <DialogDescription>
            Crie um novo contrato de aluguel. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Nome do Cliente *</Label>
              <Input
                id="cliente"
                placeholder="Empresa Ltda"
                value={formData.cliente}
                onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                className={errors.cliente ? 'border-destructive' : ''}
              />
              {errors.cliente && <p className="text-sm text-destructive">{errors.cliente}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="forklift">Empilhadeira *</Label>
              <Select
                value={formData.forkliftId}
                onValueChange={(value) => setFormData({ ...formData, forkliftId: value })}
              >
                <SelectTrigger id="forklift" className={errors.forkliftId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione uma empilhadeira disponível" />
                </SelectTrigger>
                <SelectContent>
                  {availableForklifts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhuma empilhadeira disponível
                    </SelectItem>
                  ) : (
                    availableForklifts.map((forklift: any) => (
                      <SelectItem key={forklift.id} value={forklift.id}>
                        {forklift.placa} - {forklift.marca} {forklift.modelo} ({forklift.capacidade})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.forkliftId && <p className="text-sm text-destructive">{errors.forkliftId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                  className={errors.dataInicio ? 'border-destructive' : ''}
                />
                {errors.dataInicio && <p className="text-sm text-destructive">{errors.dataInicio}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFim">Data de Término *</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                  min={formData.dataInicio}
                  className={errors.dataFim ? 'border-destructive' : ''}
                />
                {errors.dataFim && <p className="text-sm text-destructive">{errors.dataFim}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor da Diária (R$) *</Label>
              <Input
                id="valor"
                type="number"
                placeholder="350.00"
                value={formData.valorDiaria}
                onChange={(e) => setFormData({ ...formData, valorDiaria: e.target.value })}
                min="0"
                step="0.01"
                className={errors.valorDiaria ? 'border-destructive' : ''}
              />
              {errors.valorDiaria && <p className="text-sm text-destructive">{errors.valorDiaria}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={availableForklifts.length === 0 || isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar Aluguel'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
