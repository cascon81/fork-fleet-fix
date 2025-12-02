import { MainLayout } from '@/components/layout/MainLayout';
import { ForkliftTable } from '@/components/fleet/ForkliftTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Download, Loader2 } from 'lucide-react';
import { AddForkliftModal } from '@/components/modals/AddForkliftModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { mapDbForklift, type DbForklift } from '@/types/forklift';
import { toast } from 'sonner';

const Frota = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [forklifts, setForklifts] = useState<DbForklift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchForklifts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('forklifts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForklifts(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar empilhadeiras: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForklifts();
  }, [user]);

  const filteredForklifts = useMemo(() => {
    return forklifts
      .map(mapDbForklift)
      .filter(forklift => {
        const matchesSearch = 
          forklift.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
          forklift.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
          forklift.modelo.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'todos' || forklift.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
  }, [forklifts, searchTerm, statusFilter]);

  const stats = useMemo(() => ({
    total: forklifts.length,
    disponivel: forklifts.filter(f => f.status === 'disponivel').length,
    manutencao: forklifts.filter(f => f.status === 'manutencao').length,
  }), [forklifts]);

  const handleModalClose = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      fetchForklifts();
    }
  };

  return (
    <MainLayout title="Gestão da Frota">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa, marca ou modelo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="alugada">Alugada</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nova Empilhadeira
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Total na Frota</p>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Disponíveis</p>
            <p className="text-2xl font-bold text-success">{stats.disponivel}</p>
          </div>
          <div className="rounded-lg border bg-warning/10 border-warning/20 p-4">
            <p className="text-sm text-muted-foreground">Em Manutenção</p>
            <p className="text-2xl font-bold text-warning">{stats.manutencao}</p>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredForklifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'todos' 
                ? 'Nenhuma empilhadeira encontrada com os filtros aplicados.'
                : 'Nenhuma empilhadeira cadastrada. Adicione sua primeira empilhadeira!'}
            </p>
          </div>
        ) : (
          <ForkliftTable forklifts={filteredForklifts} />
        )}
      </div>

      <AddForkliftModal open={isAddModalOpen} onOpenChange={handleModalClose} />
    </MainLayout>
  );
};

export default Frota;
