'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { clearToken, getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Shield, User, Menu, X, ChevronDown, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import CannabisLeaf from '@/components/icons/CannabisLeaf';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function parseJwt(token: string): { role?: string } | null {
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

const navLinks = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/sobre', label: 'Sobre nós' },
  { href: '/planos', label: 'Planos' },
  { href: '/educacao', label: 'Educação' },
  { href: '/contato', label: 'Contato' },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const check = () => {
      const token = getToken();
      setIsAuth(!!token);
      if (token) {
        const payload = parseJwt(token);
        setIsAdmin(payload?.role === 'ADMIN');
      } else {
        setIsAdmin(false);
      }
    };
    check();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'abracann_token') {
        check();
      }
    };
    window.addEventListener('storage', onStorage);
    
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    
    const handleClickOutside = () => setUserMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    clearToken();
    setIsAuth(false);
    setIsAdmin(false);
    setUserMenuOpen(false);
    router.push('/login');
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-white/98 backdrop-blur-xl shadow-sm border-b border-gray-100" 
          : "bg-white/80 backdrop-blur-sm"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center transition-all duration-200 bg-[#3FA174] group-hover:bg-[#359966] group-hover:scale-105">
                <CannabisLeaf className="text-white" size={20} />
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">
                ABRACANM
              </span>
            </Link>

            <nav className="hidden lg:flex items-center">
              <div className="flex items-center bg-gray-50/80 rounded-full p-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      pathname === link.href
                        ? "text-white bg-[#3FA174] shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-sm"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="flex items-center gap-2 lg:gap-3">
              {isAuth ? (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setUserMenuOpen(!userMenuOpen); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200",
                      userMenuOpen 
                        ? "bg-gray-100" 
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3FA174] to-[#2D7A5A] flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">Minha Conta</span>
                    <ChevronDown size={16} className={cn(
                      "hidden sm:block text-gray-400 transition-transform duration-200",
                      userMenuOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">Bem-vindo!</p>
                          <p className="text-xs text-gray-500 mt-0.5">Gerencie sua conta</p>
                        </div>
                        
                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={18} className="text-gray-400" />
                            Minha Área
                          </Link>
                          <Link
                            href="/perfil"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings size={18} className="text-gray-400" />
                            Meu Perfil
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Shield size={18} className="text-amber-500" />
                              Painel Admin
                            </Link>
                          )}
                        </div>
                        
                        <div className="border-t border-gray-100 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut size={18} className="text-red-400" />
                            Sair da conta
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4"
                    >
                      Entrar
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    onClick={() => router.push('/cadastro')} 
                    className="bg-[#3FA174] hover:bg-[#359966] text-white rounded-full px-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Associe-se
                  </Button>
                </>
              )}

              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "text-[#3FA174] bg-[#3FA174]/10"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                
                <div className="border-t border-gray-100 pt-4 mt-4 space-y-2">
                  {isAuth ? (
                    <>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-12">
                          <LayoutDashboard size={18} />
                          Minha Área
                        </Button>
                      </Link>
                      <Link href="/perfil" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-12">
                          <User size={18} />
                          Meu Perfil
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-12 border-amber-200 text-amber-600 hover:bg-amber-50">
                            <Shield size={18} />
                            Painel Admin
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start gap-3 rounded-xl h-12 text-red-600 hover:bg-red-50 hover:text-red-700" 
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                      >
                        <LogOut size={18} />
                        Sair da conta
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-xl h-12">
                          Entrar
                        </Button>
                      </Link>
                      <Link href="/cadastro" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full rounded-xl h-12 bg-[#3FA174] hover:bg-[#359966]">
                          Associe-se
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      
      <div className="h-16 lg:h-18" />
    </>
  );
}
