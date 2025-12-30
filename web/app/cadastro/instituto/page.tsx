import type { Metadata } from 'next';
import CadastroInstitutoClient from './CadastroInstitutoClient';

export const metadata: Metadata = {
  title: 'Cadastro de Instituto | ABRACANM',
  description:
    'Cadastre seu instituto médico como parceiro da ABRACANM para oferecer cannabis medicinal.',
  alternates: { canonical: '/cadastro/instituto' },
};

export default function Page() {
  return <CadastroInstitutoClient />;
}
