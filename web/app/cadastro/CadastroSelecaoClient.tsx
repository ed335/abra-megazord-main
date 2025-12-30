'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Stethoscope, Building2, HeartHandshake, ArrowRight, ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const tiposCadastro = [
  {
    id: 'associado',
    titulo: 'Associado (Paciente)',
    descricao: 'Pacientes que buscam tratamento com cannabis medicinal. Inclui acesso a consultas, prescrições e acompanhamento médico.',
    icon: UserPlus,
    href: '/cadastro/associado',
    cor: 'bg-verde-claro/20 text-verde-oliva',
    destaque: true,
  },
  {
    id: 'medico',
    titulo: 'Médico Prescritor',
    descricao: 'Profissionais de saúde habilitados a prescrever cannabis medicinal. Requer CRM ativo e especialização.',
    icon: Stethoscope,
    href: '/cadastro/medico',
    cor: 'bg-info/20 text-info',
  },
  {
    id: 'instituto',
    titulo: 'Instituto Médico',
    descricao: 'Clínicas, hospitais e centros de tratamento interessados em oferecer cannabis medicinal aos seus pacientes.',
    icon: Building2,
    href: '/cadastro/instituto',
    cor: 'bg-alerta/20 text-alerta',
  },
  {
    id: 'parceiro',
    titulo: 'Associação Parceira',
    descricao: 'Farmácias, laboratórios, ONGs e outras organizações que desejam se tornar parceiras da ABRACANM.',
    icon: HeartHandshake,
    href: '/cadastro/parceiro',
    cor: 'bg-sucesso/20 text-sucesso',
  },
];

export default function CadastroSelecaoClient() {
  return (
    <main className="min-h-screen bg-[#fafaf8]">
      <section className="bg-white py-12 border-b border-cinza-claro">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1 text-sm text-cinza-medio hover:text-verde-oliva transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar para o início
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="text-verde-oliva text-sm font-medium tracking-wide uppercase">
              ABRACANM
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold text-cinza-escuro mt-2 mb-4 tracking-tight">
              Como deseja se cadastrar?
            </h1>
            <p className="text-lg text-cinza-medio max-w-2xl mx-auto">
              Selecione o tipo de cadastro que melhor se aplica à sua situação. 
              Cada perfil tem um processo de registro específico.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {tiposCadastro.map((tipo, index) => {
            const Icon = tipo.icon;
            return (
              <motion.div
                key={tipo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={tipo.href}>
                  <Card 
                    className={`h-full hover:shadow-lg transition-all cursor-pointer group border-2 ${
                      tipo.destaque 
                        ? 'border-verde-oliva bg-verde-claro/5' 
                        : 'border-cinza-claro hover:border-verde-oliva/50'
                    }`}
                  >
                    <CardContent className="p-6">
                      {tipo.destaque && (
                        <span className="inline-block bg-verde-oliva text-white text-xs font-medium px-2 py-1 rounded mb-4">
                          Mais comum
                        </span>
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${tipo.cor}`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-cinza-escuro mb-2 group-hover:text-verde-oliva transition-colors">
                            {tipo.titulo}
                          </h3>
                          <p className="text-sm text-cinza-medio leading-relaxed">
                            {tipo.descricao}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <span className="text-sm font-medium text-verde-oliva flex items-center gap-1 group-hover:gap-2 transition-all">
                          Iniciar cadastro
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-cinza-medio">
            Já possui cadastro?{' '}
            <Link href="/login" className="text-verde-oliva font-medium hover:underline">
              Faça login aqui
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
