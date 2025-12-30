'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'O que é uma associação canábica medicinal?',
    answer: 'Uma entidade que organiza tratamento, documentação e suporte para pacientes que usam cannabis medicinal, conectando-os a prescritores habilitados.',
  },
  {
    question: 'A AbraCann é clínica ou vende produtos?',
    answer: 'Não. Não somos clínica e não vendemos produtos. Atuamos como associação, com foco em documentação, prescrição e educação.',
  },
  {
    question: 'Preciso de receita para me cadastrar?',
    answer: 'Você pode se cadastrar e receber orientação. A prescrição é emitida apenas por médicos habilitados e validados.',
  },
  {
    question: 'Meus dados ficam seguros?',
    answer: 'Sim. Usamos criptografia, LGPD e consentimento claro. Você controla o que compartilha e com quem.',
  },
  {
    question: 'Posso ser associado se nunca usei cannabis medicinal antes?',
    answer: 'Sim. Você recebe orientação e pode falar com um prescritor habilitado para entender se há indicação para seu caso.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cinza-muito-claro">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-verde-oliva uppercase tracking-wide">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-cinza-escuro">Perguntas frequentes</h2>
          <p className="text-base sm:text-lg text-cinza-medio">
            Respostas rápidas para quem está conhecendo a associação.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="border border-cinza-claro rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-verde-oliva rounded-xl"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="text-sm sm:text-base font-semibold text-cinza-escuro">
                    {faq.question}
                  </span>
                  <span className="text-verde-oliva text-xl leading-none">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-cinza-medio leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
