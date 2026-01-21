import type { Metadata } from 'next';
import EquipeClient from './EquipeClient';

export const metadata: Metadata = {
  title: 'Equipe | Admin - ABRACANM',
  description: 'Gerenciamento de membros da equipe administrativa',
};

export default function Page() {
  return <EquipeClient />;
}
