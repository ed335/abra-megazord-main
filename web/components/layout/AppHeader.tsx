'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { clearToken, getToken } from '@/lib/auth';
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

function parseJwt(token: string): { role?: string; email?: string; nome?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

interface AppHeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function AppHeader({ onMenuClick, title }: AppHeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email?: string; nome?: string; role?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = parseJwt(token);
      setUserInfo(payload);
      setIsAdmin(payload?.role === 'ADMIN');
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-cinza-claro">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {title && (
            <h1 className="text-lg font-semibold text-cinza-escuro hidden sm:block">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link href="/admin">
              <Badge
                variant="secondary"
                className="cursor-pointer bg-amber-100 text-amber-800 border-amber-200"
              >
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </Link>
          )}

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5 text-cinza-medio" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-erro rounded-full" />
          </Button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-off-white transition-colors"
            >
              <div className="w-8 h-8 bg-verde-oliva/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-verde-oliva" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-cinza-escuro">
                  {userInfo?.nome || 'Usuário'}
                </p>
                <p className="text-xs text-cinza-medio truncate max-w-[120px]">
                  {userInfo?.email || ''}
                </p>
              </div>
              <ChevronDown className={cn(
                "w-4 h-4 text-cinza-medio transition-transform hidden sm:block",
                showUserMenu && "rotate-180"
              )} />
            </button>

            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-cinza-claro py-2 z-50">
                  <div className="px-4 py-2 border-b border-cinza-claro mb-2">
                    <p className="text-sm font-medium text-cinza-escuro">
                      {userInfo?.nome || 'Usuário'}
                    </p>
                    <p className="text-xs text-cinza-medio truncate">
                      {userInfo?.email || ''}
                    </p>
                  </div>
                  
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-cinza-escuro hover:bg-off-white transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Meu Perfil
                  </Link>
                  
                  <Link
                    href="/perfil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-cinza-escuro hover:bg-off-white transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Configurações
                  </Link>
                  
                  <div className="border-t border-cinza-claro mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-erro hover:bg-erro/5 transition-colors w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
