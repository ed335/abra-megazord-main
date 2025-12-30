'use client';

import { motion } from 'framer-motion';

const aboutCards = [
  {
    title: 'Medicina com Acolhimento',
    description:
      'Recebemos cada pessoa com respeito e empatia, entendendo que buscar tratamento é um passo corajoso rumo a mais qualidade de vida.',
    icon: (
      <svg className="w-6 h-6 text-verde-oliva" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 21s-6-4.35-6-10a6 6 0 1112 0c0 5.65-6 10-6 10z" />
        <path d="M10 11h4" />
      </svg>
    ),
  },
  {
    title: 'Ciência e Segurança',
    description:
      'Baseamos nosso trabalho em evidências científicas, garantindo tratamentos seguros com total conformidade legal e proteção de dados.',
    icon: (
      <svg className="w-6 h-6 text-verde-oliva" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 3l7 4v5c0 4.418-3.582 8-8 8s-8-3.582-8-8V7l7-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Transformando Vidas',
    description:
      'A cannabis medicinal pode melhorar significativamente a qualidade de vida, saúde e longevidade de milhares de pessoas.',
    icon: (
      <svg className="w-6 h-6 text-verde-oliva" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 3l7 4v5c0 4.418-3.582 8-8 8s-8-3.582-8-8V7l7-4z" />
        <path d="M9 12h6M12 9v6" />
      </svg>
    ),
  },
];

export default function AboutSection() {
  return (
    <section id="sobre" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cinza-muito-claro">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <p className="text-sm font-semibold text-verde-oliva uppercase tracking-wide">
            Conheça a ABRACANM
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-cinza-escuro">
            Associação Brasileira de Cannabis Medicinal
          </h2>
          <div className="space-y-3 max-w-4xl mx-auto text-base sm:text-lg text-cinza-medio leading-relaxed">
            <p>
              A ABRACANM nasceu para quebrar barreiras e acolher todos que buscam uma vida melhor através da medicina canábica. 
              Acreditamos que o acesso ao tratamento deve ser seguro, humanizado e livre de preconceitos.
            </p>
            <p>
              Não somos clínica nem loja. Somos uma ponte entre você e o cuidado que você merece, 
              com foco em saúde, qualidade de vida e longevidade.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aboutCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="h-full bg-white border border-cinza-claro rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-verde-claro/15 mb-4">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-cinza-escuro mb-2">{card.title}</h3>
              <p className="text-sm text-cinza-medio leading-relaxed">{card.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
