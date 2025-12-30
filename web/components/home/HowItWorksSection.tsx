'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const steps = [
  {
    title: 'Cadastre-se',
    description:
      'Crie sua conta, aceite o consentimento LGPD e valide seu e-mail. Tudo começa com segurança.',
  },
  {
    title: 'Conecte-se a um prescritor',
    description:
      'Escolha um profissional com CRM validado. Marque consulta e compartilhe seus dados com controle.',
  },
  {
    title: 'Receba sua documentação',
    description:
      'Receba prescrição e documentos em formato digital, com QR code e assinatura eletrônica.',
  },
  {
    title: 'Acompanhe e organize',
    description:
      'Acesse cartão digital, histórico e educação segura. Conte com acompanhamento contínuo.',
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-cinza-muito-claro"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-cinza-escuro mb-4">
            Como Funciona
          </h2>
          <p className="text-base sm:text-lg text-cinza-medio max-w-2xl mx-auto">
            4 passos simples para ter acesso à cannabis medicinal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative bg-white border border-cinza-claro rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Número do passo */}
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-10 h-10 border border-verde-oliva text-verde-oliva rounded-full font-semibold text-base">
                  {index + 1}
                </div>
              </div>

              {/* Linhas conectoras (desktop) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-24 w-full h-0.5 bg-gradient-to-r from-verde-oliva to-transparent" />
              )}

              {/* Card */}
              <h3 className="text-lg font-semibold text-cinza-escuro mb-2">
                {step.title}
              </h3>
              <p className="text-cinza-medio text-sm leading-relaxed mb-2">
                {step.description}
              </p>

              {/* Check icon */}
              <CheckCircle className="w-5 h-5 text-verde-oliva" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
