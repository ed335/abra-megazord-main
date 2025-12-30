'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Calendar, 
  CreditCard, 
  Package,
  MessageCircle,
  FileText,
  X,
  ChevronLeft,
  ClipboardList,
  Video,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/associados', label: 'Associados', icon: Users },
  { href: '/admin/agendamentos', label: 'Agendamentos', icon: Calendar },
  { href: '/admin/assinaturas', label: 'Assinaturas', icon: FileText },
  { href: '/admin/pagamentos', label: 'Pagamentos', icon: CreditCard },
  { href: '/admin/planos', label: 'Planos', icon: Package },
  { href: '/medico/consultas', label: 'Teleconsultas', icon: Video },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: MessageCircle },
  { href: '/admin/logs', label: 'Logs', icon: ClipboardList },
  { href: '/admin/admins', label: 'Administradores', icon: Shield },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-cinza-escuro transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center justify-between p-4 border-b border-white/10",
            collapsed && "lg:justify-center lg:px-2"
          )}>
            <Link href="/admin" className={cn(
              "flex items-center gap-3",
              collapsed && "lg:hidden"
            )}>
              <div className="w-10 h-10 bg-verde-oliva rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">ABRACANM</span>
                <span className="block text-xs text-cinza-medio">Painel Admin</span>
              </div>
            </Link>
            
            {collapsed && (
              <Link href="/admin" className="hidden lg:flex">
                <div className="w-10 h-10 bg-verde-oliva rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </Link>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>

            {onToggleCollapse && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleCollapse}
                className="hidden lg:flex text-white hover:bg-white/10"
              >
                <ChevronLeft className={cn(
                  "w-5 h-5 transition-transform",
                  collapsed && "rotate-180"
                )} />
              </Button>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    collapsed && "lg:justify-center lg:px-2",
                    isActive 
                      ? "bg-verde-oliva text-white" 
                      : "text-cinza-claro hover:bg-white/10 hover:text-white"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className={cn(
            "p-4 border-t border-white/10",
            collapsed && "lg:px-2"
          )}>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cinza-claro hover:bg-white/10 hover:text-white transition-all",
                collapsed && "lg:justify-center lg:px-2"
              )}
              title={collapsed ? "Voltar ao Site" : undefined}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>Voltar ao Site</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
