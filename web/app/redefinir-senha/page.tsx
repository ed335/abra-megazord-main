import type { Metadata } from 'next';
import { Suspense } from 'react';
import RedefinirSenhaClient from './RedefinirSenhaClient';

export const metadata: Metadata = {
  title: 'Redefinir Senha | ABRACANM',
  description: 'Crie uma nova senha para sua conta ABRACANM.',
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
      <RedefinirSenhaClient />
    </Suspense>
  );
}
