import type { Metadata } from 'next';
import CadastroMedicoClient from './CadastroMedicoClient';

export const metadata: Metadata = {
  title: 'Cadastro de Médico | ABRACANM',
  description:
    'Cadastre-se como médico prescritor na ABRACANM para atender pacientes de cannabis medicinal.',
  alternates: { canonical: '/cadastro/medico' },
};

export default function Page() {
  return <CadastroMedicoClient />;
}
