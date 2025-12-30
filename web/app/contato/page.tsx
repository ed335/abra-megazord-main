import type { Metadata } from 'next';
import ContatoClient from './ContatoClient';

export const metadata: Metadata = {
  title: 'Contato | Abracanm - Associação Brasileira de Cannabis Medicinal',
  description:
    'Fale com a Abracanm sobre cadastro, prescritores e dúvidas de cannabis medicinal. Resposta em até 1 dia útil.',
  alternates: { canonical: '/contato' },
};

export default function Page() {
  return <ContatoClient />;
}
