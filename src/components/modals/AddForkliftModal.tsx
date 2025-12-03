import { useState } from 'react';
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
import { forkliftSchema } from '@/lib/validations';

interface AddForkliftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddForkliftModal({ open, onOpenChange }: AddForkliftModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    capacidade: '',
    anoFabricacao: '',
    horasUso: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      capacidade: '',
      anoFabricacao: '',
      horasUso: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!user) {
      toast.error('Você precisa estar logado para adicionar uma empilhadeira');
      return;
    }

    const validation = forkliftSchema.safeParse({
      ...formData,
      anoFabricacao: formData.anoFabricacao ? parseInt(formData.anoFabricacao) : 0,
      horasUso: formData.horasUso ? parseInt(formData.horasUso) : 0,
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
      const { error } = await supabase.from('forklifts').insert({
        user_id: user.id,
        placa: formData.placa,
        marca: formData.marca,
        modelo: formData.modelo,
        capacidade: formData.capacidade,
        ano_fabricacao: parseInt(formData.anoFabricacao),
        horas_uso: parseInt(formData.horasUso),
        status: 'disponivel',
      });

      if (error) throw error;

      toast.success('Empilhadeira cadastrada com sucesso!', {
        description: `${formData.marca} ${formData.modelo} - ${formData.placa}`,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao cadastrar empilhadeira', {
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
          <DialogTitle>Cadastrar Nova Empilhadeira</DialogTitle>
          <DialogDescription>
            Adicione uma nova empilhadeira à frota. Todos os campos são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa/ID *</Label>
                <Input
                  id="placa"
                  placeholder="EMP-0001"
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                  className={errors.placa ? 'border-destructive' : ''}
                />
                {errors.placa && <p className="text-sm text-destructive">{errors.placa}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Select
                  value={formData.marca}
                  onValueChange={(value) => setFormData({ ...formData, marca: value })}
                >
                  <SelectTrigger id="marca" className={errors.marca ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Hyster">Hyster</SelectItem>
                    <SelectItem value="Caterpillar">Caterpillar</SelectItem>
                    <SelectItem value="Komatsu">Komatsu</SelectItem>
                    <SelectItem value="Nissan">Nissan</SelectItem>
                    <SelectItem value="Jungheinrich">Jungheinrich</SelectItem>
                  </SelectContent>
                </Select>
                {errors.marca && <p className="text-sm text-destructive">{errors.marca}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  placeholder="8FGCU25"
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className={errors.modelo ? 'border-destructive' : ''}
                />
                {errors.modelo && <p className="text-sm text-destructive">{errors.modelo}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade *</Label>
                <Select
                  value={formData.capacidade}
                  onValueChange={(value) => setFormData({ ...formData, capacidade: value })}
                >
                  <SelectTrigger id="capacidade" className={errors.capacidade ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.500 kg">1.500 kg</SelectItem>
                    <SelectItem value="1.600 kg">1.600 kg</SelectItem>
                    <SelectItem value="2.000 kg">2.000 kg</SelectItem>
                    <SelectItem value="2.500 kg">2.500 kg</SelectItem>
                    <SelectItem value="3.000 kg">3.000 kg</SelectItem>
                    <SelectItem value="5.000 kg">5.000 kg</SelectItem>
                  </SelectContent>
                </Select>
                {errors.capacidade && <p className="text-sm text-destructive">{errors.capacidade}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano de Fabricação *</Label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="2024"
                  value={formData.anoFabricacao}
                  onChange={(e) => setFormData({ ...formData, anoFabricacao: e.target.value })}
                  className={errors.anoFabricacao ? 'border-destructive' : ''}
                />
                {errors.anoFabricacao && <p className="text-sm text-destructive">{errors.anoFabricacao}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="horas">Horas de Uso *</Label>
                <Input
                  id="horas"
                  type="number"
                  placeholder="0"
                  value={formData.horasUso}
                  onChange={(e) => setFormData({ ...formData, horasUso: e.target.value })}
                  className={errors.horasUso ? 'border-destructive' : ''}
                />
                {errors.horasUso && <p className="text-sm text-destructive">{errors.horasUso}</p>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Empilhadeira'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
