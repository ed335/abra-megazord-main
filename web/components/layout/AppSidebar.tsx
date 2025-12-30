'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Calendar, 
  FileText, 
  User, 
  CreditCard, 
  MessageCircle,
  BookOpen,
  X,
  ChevronLeft
} from 'lucide-react';
import CannabisLeaf from '@/components/icons/CannabisLeaf';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/pre-anamnese', label: 'Pré-Anamnese', icon: FileText },
  { href: '/agendar', label: 'Agendar Consulta', icon: Calendar },
  { href: '/planos', label: 'Planos', icon: CreditCard },
  { href: '/educacao', label: 'Educação', icon: BookOpen },
  { href: '/perfil', label: 'Meu Perfil', icon: User },
  { href: '/contato', label: 'Suporte', icon: MessageCircle },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AppSidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }: AppSidebarProps) {
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
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-cinza-claro transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
          "w-72"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "flex items-center justify-between p-4 border-b border-cinza-claro",
            collapsed && "lg:justify-center lg:px-3"
          )}>
            <Link href="/" className={cn(
              "flex items-center gap-3",
              collapsed && "lg:hidden"
            )}>
              <div className="w-10 h-10 bg-verde-oliva rounded-xl flex items-center justify-center">
                <CannabisLeaf className="text-white" size={20} />
              </div>
              <span className="text-lg font-bold text-cinza-escuro">ABRACANM</span>
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>

            {onToggleCollapse && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleCollapse}
                className={cn(
                  "hidden lg:flex",
                  collapsed && "w-10 h-10"
                )}
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
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    collapsed && "lg:justify-center lg:px-3",
                    isActive 
                      ? "bg-verde-oliva text-white shadow-sm" 
                      : "text-cinza-medio hover:bg-off-white hover:text-cinza-escuro"
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
            "p-4 border-t border-cinza-claro",
            collapsed && "lg:px-3"
          )}>
            <div className={cn(
              "bg-verde-claro/10 rounded-xl p-4",
              collapsed && "lg:p-3"
            )}>
              <div className={cn(
                "flex items-center gap-3 mb-2",
                collapsed && "lg:justify-center"
              )}>
                <div className="w-8 h-8 bg-verde-oliva/20 rounded-lg flex items-center justify-center">
                  <CannabisLeaf className="text-verde-oliva" size={16} />
                </div>
                <span className={cn(
                  "text-sm font-medium text-cinza-escuro",
                  collapsed && "lg:hidden"
                )}>
                  Precisa de ajuda?
                </span>
              </div>
              <p className={cn(
                "text-xs text-cinza-medio mb-3",
                collapsed && "lg:hidden"
              )}>
                Nossa equipe está pronta para te ajudar.
              </p>
              <Link href="/contato" className={cn(collapsed && "lg:hidden")}>
                <Button variant="outline" size="sm" className="w-full">
                  Falar com Suporte
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
