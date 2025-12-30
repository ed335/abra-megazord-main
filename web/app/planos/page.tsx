'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pricing } from '@/components/ui/pricing';
import { Shield, Users, Clock, HeartPulse, FileText, MessageCircle, Stethoscope, Check, X, Loader2 } from 'lucide-react';

interface Plano {
  id: string;
  nome: string;
  descricao: string;
  tipo: string;
  valorMensalidade: number;
  valorConsulta: number;
  valorPrimeiraConsulta: number;
  beneficios: string[];
  ativo: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

const BENEFICIOS_DETALHADOS = [
  {
    icon: Stethoscope,
    titulo: 'Consultas com Desconto',
    descricao: 'Primeira consulta por R$ 99 e consultas de retorno com preço especial.',
  },
  {
    icon: FileText,
    titulo: 'Receita Digital Válida',
    descricao: 'Receitas emitidas por médicos prescritores, válidas em todo território nacional.',
  },
  {
    icon: HeartPulse,
    titulo: 'Desconto em Medicamentos',
    descricao: 'Descontos exclusivos em medicamentos através de parceiros autorizados.',
  },
  {
    icon: MessageCircle,
    titulo: 'Suporte via WhatsApp',
    descricao: 'Tire dúvidas sobre tratamento, produtos e legislação com nossa equipe.',
  },
  {
    icon: Users,
    titulo: 'Acompanhamento Contínuo',
    descricao: 'Monitoramento do tratamento com ajustes conforme sua evolução.',
  },
  {
    icon: Shield,
    titulo: 'Segurança Jurídica',
    descricao: 'Orientação sobre importação legal e direitos do paciente.',
  },
];

const COMPARATIVO = [
  { item: 'Consulta com médico prescritor', associado: true, avulso: true },
  { item: 'Receita digital se indicado', associado: true, avulso: true },
  { item: 'Primeira consulta por R$ 99', associado: true, avulso: false },
  { item: 'Suporte via WhatsApp', associado: true, avulso: false },
  { item: 'Conteúdo educativo exclusivo', associado: true, avulso: false },
  { item: 'Acompanhamento contínuo', associado: true, avulso: false },
  { item: 'Descontos em consultas de retorno', associado: true, avulso: false },
  { item: 'Desconto em medicamentos', associado: true, avulso: false },
  { item: 'Orientação jurídica', associado: true, avulso: false },
];

const FALLBACK_PLANOS: Plano[] = [
  {
    id: 'plano-essencial',
    nome: 'Essencial',
    descricao: 'Acesso completo à plataforma ABRACANM',
    tipo: 'MENSAL',
    valorMensalidade: 40,
    valorConsulta: 149,
    valorPrimeiraConsulta: 99,
    beneficios: [
      'Acesso à plataforma',
      'Conteúdo educativo',
      'Suporte via WhatsApp',
      'Acompanhamento personalizado',
    ],
    ativo: true,
  },
  {
    id: 'plano-completo',
    nome: 'Completo',
    descricao: 'Todos os benefícios + consulta de retorno gratuita',
    tipo: 'MENSAL',
    valorMensalidade: 100,
    valorConsulta: 79,
    valorPrimeiraConsulta: 79,
    beneficios: [
      'Consulta de retorno gratuita',
      'Prioridade no agendamento',
      'Grupo exclusivo de pacientes',
    ],
    ativo: true,
  },
];

function convertToPricingPlans(planos: Plano[]): PricingPlan[] {
  const consultaAvulsa: PricingPlan = {
    name: 'Consulta Avulsa',
    price: '149',
    yearlyPrice: '149',
    period: 'consulta',
    features: [
      'Consulta com médico prescritor',
      'Receita digital se indicado',
      'Orientações sobre o tratamento',
      'Sem mensalidade',
      'Pague apenas quando precisar',
    ],
    description: 'Para quem prefere pagar apenas quando precisar',
    buttonText: 'Agendar Consulta',
    href: '/agendar-consulta',
    isPopular: false,
  };

  const planosConvertidos = planos.slice(0, 2).map((plano, index) => ({
    name: `Plano ${plano.nome}`,
    price: String(Math.round(plano.valorMensalidade)),
    yearlyPrice: String(Math.round(plano.valorMensalidade * 0.8)),
    period: 'mês',
    features: [
      `Primeira consulta por R$ ${plano.valorPrimeiraConsulta.toFixed(0)}`,
      'Suporte contínuo via WhatsApp',
      'Conteúdo educativo exclusivo',
      'Acompanhamento do tratamento',
      'Descontos em consultas de retorno',
      'Desconto em medicamentos',
      ...(index === 1 ? ['Consulta de retorno gratuita', 'Prioridade no agendamento'] : []),
    ],
    description: 'Cancele quando quiser, sem multa',
    buttonText: 'Tornar-se Associado',
    href: `/checkout?plano=${plano.id}&tipo=MENSALIDADE`,
    isPopular: index === 0,
  }));

  return [consultaAvulsa, ...planosConvertidos];
}

export default function PlanosPage() {
  const [loading, setLoading] = useState(true);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);

  useEffect(() => {
    fetch('/api/planos')
      .then(res => res.json())
      .then(data => {
        const planosData = data.planos?.length >= 2 ? data.planos : FALLBACK_PLANOS;
        setPricingPlans(convertToPricingPlans(planosData));
        setLoading(false);
      })
      .catch(() => {
        setPricingPlans(convertToPricingPlans(FALLBACK_PLANOS));
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="pt-16 pb-8 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
          >
            Seu caminho para o tratamento
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-500 max-w-2xl mx-auto mb-8"
          >
            Conectamos você a médicos prescritores com suporte completo 
            e acompanhamento durante toda sua jornada de tratamento.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#3FA174]" />
              <span>100% Legal</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#3FA174]" />
              <span>+5.000 pacientes</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3FA174]" />
              <span>Atendimento em até 48h</span>
            </div>
          </motion.div>
        </div>
      </section>

      <Pricing 
        plans={pricingPlans}
        title="Escolha o plano ideal"
        description="Todos os planos incluem acesso à nossa plataforma e suporte dedicado."
      />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="mb-12 bg-white border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-center text-gray-900">
                Compare as opções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500"></th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-[#3FA174]">Associado</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Avulso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARATIVO.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-700">{row.item}</td>
                        <td className="text-center py-3 px-4">
                          {row.associado ? (
                            <Check className="w-4 h-4 text-[#3FA174] mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-200 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {row.avulso ? (
                            <Check className="w-4 h-4 text-gray-400 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-200 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-gray-900 text-center mb-8"
        >
          O que você recebe como associado
        </motion.h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {BENEFICIOS_DETALHADOS.map((beneficio, idx) => {
            const Icon = beneficio.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="bg-white border-gray-100 hover:border-[#3FA174]/30 transition-colors h-full">
                  <CardContent className="pt-5 pb-5">
                    <div className="w-10 h-10 bg-[#3FA174]/10 rounded-xl flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-[#3FA174]" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1.5 text-gray-900">{beneficio.titulo}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{beneficio.descricao}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gray-50 border-gray-100">
            <CardContent className="py-8 text-center">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Ainda tem dúvidas?
              </h2>
              <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
                Nossa equipe está pronta para ajudar você a entender se a cannabis medicinal 
                é indicada para o seu caso.
              </p>
              <Button variant="outline" asChild className="border-[#3FA174] text-[#3FA174] hover:bg-[#3FA174] hover:text-white">
                <a
                  href="https://wa.me/5561981471038?text=Olá! Gostaria de saber mais sobre os planos da ABRACANM"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Falar pelo WhatsApp
                </a>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
