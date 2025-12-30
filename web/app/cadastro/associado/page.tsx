import type { Metadata } from 'next';
import CadastroAssociadoClient from '../CadastroAssociadoClient';

export const metadata: Metadata = {
  title: 'Cadastro de Associado | ABRACANM',
  description:
    'Torne-se um associado da ABRACANM para acessar tratamento seguro com cannabis medicinal.',
  alternates: { canonical: '/cadastro/associado' },
};

export default function Page() {
  return <CadastroAssociadoClient />;
}
