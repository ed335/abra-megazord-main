import type { Metadata } from 'next';
import EsqueciSenhaClient from './EsqueciSenhaClient';

export const metadata: Metadata = {
  title: 'Esqueci Minha Senha | ABRACANM',
  description: 'Recupere o acesso à sua conta ABRACANM.',
};

export default function Page() {
  return <EsqueciSenhaClient />;
}
