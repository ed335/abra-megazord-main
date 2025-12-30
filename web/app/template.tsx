'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/shared/Header';

const noHeaderRoutes = [
  '/admin',
  '/login',
  '/cadastro',
  '/medico',
  '/dashboard',
  '/perfil',
  '/agendar',
  '/checkout',
  '/consulta',
  '/pre-anamnese',
  '/carteirinha',
];

export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const shouldShowHeader = !noHeaderRoutes.some(route => pathname.startsWith(route));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.35, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {shouldShowHeader && <Header />}
      {children}
    </motion.div>
  );
}
