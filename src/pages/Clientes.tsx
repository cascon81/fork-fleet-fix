import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { AddClientModal } from '@/components/modals/AddClientModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { DbClient } from '@/types/forklift';

const Clientes = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [clientes, setClientes] = useState<DbClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClientes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar clientes: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [user]);

  const filteredClientes = useMemo(() => {
    return clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj.includes(searchTerm)
    );
  }, [clientes, searchTerm]);

  const stats = useMemo(() => ({
    total: clientes.length,
    comAlugueis: clientes.filter(c => c.alugueis_ativos > 0).length,
    inativos: clientes.filter(c => c.alugueis_ativos === 0).length,
  }), [clientes]);

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      fetchClientes();
    }
  };

  return (
    <MainLayout title="Gestão de Clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Com Aluguéis Ativos</p>
            <p className="text-2xl font-bold text-success">{stats.comAlugueis}</p>
          </div>
          <div className="rounded-lg border bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.inativos}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'Nenhum cliente encontrado com os filtros aplicados.'
                : 'Nenhum cliente cadastrado. Adicione seu primeiro cliente!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="rounded-xl border bg-card p-6 shadow-card transition-all hover:shadow-card-hover animate-fade-in"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cliente.nome}</h3>
                      <p className="text-sm text-muted-foreground">CNPJ: {cliente.cnpj}</p>
                    </div>
                  </div>
                  {cliente.alugueis_ativos > 0 && (
                    <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                      {cliente.alugueis_ativos} aluguel ativo
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Contato: <span className="text-foreground">{cliente.contato}</span>
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {cliente.telefone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {cliente.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {cliente.endereco}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Ver Histórico
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Novo Aluguel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddClientModal open={isAddModalOpen} onOpenChange={handleModalClose} />
    </MainLayout>
  );
};

export default Clientes;
