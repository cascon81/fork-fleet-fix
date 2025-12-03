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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { clientSchema } from '@/lib/validations';

interface AddClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClientModal({ open, onOpenChange }: AddClientModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      contato: '',
      telefone: '',
      email: '',
      endereco: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!user) {
      toast.error('Você precisa estar logado para adicionar um cliente');
      return;
    }

    const validation = clientSchema.safeParse(formData);
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
      const { error } = await supabase.from('clients').insert({
        user_id: user.id,
        nome: formData.nome,
        cnpj: formData.cnpj,
        contato: formData.contato,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
      });

      if (error) throw error;

      toast.success('Cliente cadastrado com sucesso!', {
        description: `${formData.nome} - ${formData.cnpj}`,
      });
      
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error('Erro ao cadastrar cliente', {
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
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                maxLength={18}
                className={errors.cnpj ? 'border-destructive' : ''}
              />
              {errors.cnpj && <p className="text-sm text-destructive">{errors.cnpj}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato *</Label>
                <Input
                  id="contato"
                  placeholder="João Silva"
                  value={formData.contato}
                  onChange={(e) => setFormData({ ...formData, contato: e.target.value })}
                  className={errors.contato ? 'border-destructive' : ''}
                />
                {errors.contato && <p className="text-sm text-destructive">{errors.contato}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  maxLength={15}
                  className={errors.telefone ? 'border-destructive' : ''}
                />
                {errors.telefone && <p className="text-sm text-destructive">{errors.telefone}</p>}
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
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                placeholder="Rua, número, bairro, cidade - UF"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className={errors.endereco ? 'border-destructive' : ''}
              />
              {errors.endereco && <p className="text-sm text-destructive">{errors.endereco}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
