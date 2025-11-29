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
import { toast } from 'sonner';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cliente cadastrado com sucesso!', {
      description: `${formData.nome} - ${formData.cnpj}`,
    });
    onOpenChange(false);
    setFormData({
      nome: '',
      cnpj: '',
      contato: '',
      telefone: '',
      email: '',
      endereco: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
          <DialogDescription>
            Adicione um novo cliente ao sistema. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Razão Social *</Label>
              <Input
                id="nome"
                placeholder="Empresa Ltda"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                required
                maxLength={18}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato *</Label>
                <Input
                  id="contato"
                  placeholder="João Silva"
                  value={formData.contato}
                  onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  required
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                placeholder="Rua, número, bairro, cidade - UF"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Cliente</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
