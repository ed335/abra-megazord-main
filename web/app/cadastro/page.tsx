import type { Metadata } from 'next';
import CadastroSelecaoClient from './CadastroSelecaoClient';

export const metadata: Metadata = {
  title: 'Cadastro | ABRACANM',
  description:
    'Escolha o tipo de cadastro: Associado, Médico, Instituto ou Associação Parceira.',
  alternates: { canonical: '/cadastro' },
};

export default function Page() {
  return <CadastroSelecaoClient />;
}
