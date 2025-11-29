import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Truck, 
  FileText, 
  Wrench, 
  Users,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Truck, label: 'Frota', path: '/frota' },
  { icon: FileText, label: 'Aluguéis', path: '/alugueis' },
  { icon: Wrench, label: 'Manutenções', path: '/manutencoes' },
  { icon: Users, label: 'Clientes', path: '/clientes' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 gradient-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-24 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg gradient-accent">
            <Truck className="h-8 w-8 text-sidebar-background" />
          </div>
          <div>
            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight leading-tight">
              Nevalf Empilhadeiras
            </h1>
            <p className="text-xs text-sidebar-foreground/60 font-medium mt-0.5">Gestão de Frotas</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
              activeClassName="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3">
          <NavLink
            to="/configuracoes"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          >
            <Settings className="h-5 w-5" />
            Configurações
          </NavLink>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive transition-all">
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
