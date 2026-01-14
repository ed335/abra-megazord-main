'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users,
  FileText,
  Video,
  Settings,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { removeMedicoToken } from '@/lib/medico-auth-client';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/medico', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/medico/agenda', label: 'Minha Agenda', icon: Calendar },
  { href: '/medico/pacientes', label: 'Meus Pacientes', icon: Users },
  { href: '/medico/consultas', label: 'Teleconsulta', icon: Video },
  { href: '/medico/prescricoes', label: 'Prescrições', icon: FileText },
];

interface MedicoLayoutProps {
  children: React.ReactNode;
  medico?: {
    nome: string;
    crm: string;
    especialidade: string;
  };
}

export default function MedicoLayout({ children, medico }: MedicoLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    removeMedicoToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-transform duration-300 w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <Link href="/medico" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-verde-oliva rounded-xl flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">ABRACANM</span>
                <span className="block text-xs text-gray-500">Portal Médico</span>
              </div>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {medico && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-verde-oliva/10 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-verde-oliva" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">Dr(a). {medico.nome}</p>
                  <p className="text-xs text-gray-500">CRM: {medico.crm}</p>
                  <p className="text-xs text-verde-oliva">{medico.especialidade}</p>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-verde-oliva text-white" 
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-1">
            <Link
              href="/medico/configuracoes"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:ml-64 min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-4 ml-auto">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
