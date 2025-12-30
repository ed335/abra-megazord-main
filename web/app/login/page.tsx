import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Login | Abracanm - Associação Brasileira de Cannabis Medicinal',
  description:
    'Entre na sua conta Abracanm para acompanhar sua jornada de cannabis medicinal com segurança e acolhimento.',
  alternates: { canonical: '/login' },
};

export default function Page() {
  return <LoginClient />;
}
