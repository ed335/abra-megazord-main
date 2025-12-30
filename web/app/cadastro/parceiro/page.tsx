import type { Metadata } from 'next';
import CadastroParceiroClient from './CadastroParceiroClient';

export const metadata: Metadata = {
  title: 'Cadastro de Associação Parceira | ABRACANM',
  description:
    'Cadastre sua organização como parceira da ABRACANM para colaborar na democratização da cannabis medicinal.',
  alternates: { canonical: '/cadastro/parceiro' },
};

export default function Page() {
  return <CadastroParceiroClient />;
}
