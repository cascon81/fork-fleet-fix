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

interface AddForkliftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddForkliftModal({ open, onOpenChange }: AddForkliftModalProps) {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    capacidade: '',
    anoFabricacao: '',
    horasUso: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Empilhadeira cadastrada com sucesso!', {
      description: `${formData.marca} ${formData.modelo} - ${formData.placa}`,
    });
    onOpenChange(false);
    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      capacidade: '',
      anoFabricacao: '',
      horasUso: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Select
                  value={formData.marca}
                  onValueChange={(value) => setFormData({ ...formData, marca: value })}
                >
                  <SelectTrigger id="marca">
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacidade">Capacidade *</Label>
                <Select
                  value={formData.capacidade}
                  onValueChange={(value) => setFormData({ ...formData, capacidade: value })}
                >
                  <SelectTrigger id="capacidade">
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
                  required
                  min="2000"
                  max="2025"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horas">Horas de Uso *</Label>
                <Input
                  id="horas"
                  type="number"
                  placeholder="0"
                  value={formData.horasUso}
                  onChange={(e) => setFormData({ ...formData, horasUso: e.target.value })}
                  required
                  min="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Empilhadeira</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
