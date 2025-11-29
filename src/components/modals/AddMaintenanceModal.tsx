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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { forklifts } from '@/data/mockData';
import { toast } from 'sonner';

interface AddMaintenanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaintenanceModal({ open, onOpenChange }: AddMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    forkliftId: '',
    tipo: '',
    descricao: '',
    dataAgendada: '',
    custo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const forklift = forklifts.find(f => f.id === formData.forkliftId);
    toast.success('Manutenção agendada com sucesso!', {
      description: `${forklift?.marca} ${forklift?.modelo} - ${formData.tipo}`,
    });
    onOpenChange(false);
    setFormData({
      forkliftId: '',
      tipo: '',
      descricao: '',
      dataAgendada: '',
      custo: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                <SelectTrigger id="forklift">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Manutenção *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva os serviços a serem realizados..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data Agendada *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.dataAgendada}
                  onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                  required
                />
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
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agendar Manutenção</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
