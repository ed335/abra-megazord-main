import type { Metadata } from 'next';
import AssociadosClient from './AssociadosClient';

export const metadata: Metadata = {
  title: 'Associados | Admin - ABRACANN',
  description: 'Lista de associados cadastrados na ABRACANN',
};

export default function Page() {
  return <AssociadosClient />;
}
