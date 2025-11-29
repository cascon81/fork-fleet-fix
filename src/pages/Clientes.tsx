import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';
import { AddClientModal } from '@/components/modals/AddClientModal';

const clientes = [
  {
    id: '1',
    nome: 'Logística ABC Ltda',
    cnpj: '12.345.678/0001-90',
    contato: 'Carlos Silva',
    telefone: '(11) 99999-1234',
    email: 'carlos@logisticaabc.com',
    endereco: 'Rua Industrial, 500 - São Paulo, SP',
    alugueisAtivos: 1,
  },
  {
    id: '2',
    nome: 'Indústria MetalForte',
    cnpj: '98.765.432/0001-10',
    contato: 'Maria Santos',
    telefone: '(11) 98888-5678',
    email: 'maria@metalforte.com.br',
    endereco: 'Av. Metalúrgica, 1200 - Guarulhos, SP',
    alugueisAtivos: 1,
  },
  {
    id: '3',
    nome: 'Distribuidora Norte Sul',
    cnpj: '45.678.901/0001-23',
    contato: 'João Pereira',
    telefone: '(11) 97777-9012',
    email: 'joao@nortesul.com',
    endereco: 'Rod. Anhanguera, Km 45 - Jundiaí, SP',
    alugueisAtivos: 1,
  },
  {
    id: '4',
    nome: 'Armazém Central',
    cnpj: '23.456.789/0001-45',
    contato: 'Ana Costa',
    telefone: '(11) 96666-3456',
    email: 'ana@armazemcentral.com.br',
    endereco: 'Rua do Comércio, 300 - Campinas, SP',
    alugueisAtivos: 0,
  },
];

const Clientes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm)
  );

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
            <p className="text-2xl font-bold text-foreground">{clientes.length}</p>
          </div>
          <div className="rounded-lg border bg-success/10 border-success/20 p-4">
            <p className="text-sm text-muted-foreground">Com Aluguéis Ativos</p>
            <p className="text-2xl font-bold text-success">
              {clientes.filter(c => c.alugueisAtivos > 0).length}
            </p>
          </div>
          <div className="rounded-lg border bg-secondary p-4">
            <p className="text-sm text-muted-foreground">Inativos</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {clientes.filter(c => c.alugueisAtivos === 0).length}
            </p>
          </div>
        </div>

        {/* Cards Grid */}
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
                {cliente.alugueisAtivos > 0 && (
                  <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                    {cliente.alugueisAtivos} aluguel ativo
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
      </div>

      <AddClientModal open={isAddModalOpen} onOpenChange={setIsAddModalOpen} />
    </MainLayout>
  );
};

export default Clientes;
