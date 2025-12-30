'use client';

import { motion } from 'framer-motion';

const badges = [
  'Dados criptografados e protegidos',
  'Fluxos alinhados à legislação de saúde',
  'Consentimento informado em todas as etapas',
];

export default function SecuritySection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-cinza-escuro text-off-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold text-off-white/90 uppercase tracking-wide">
            Segurança & Legalidade
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-off-white">
            Segurança, privacidade e responsabilidade em primeiro lugar
          </h2>
          <p className="text-base sm:text-lg text-off-white/85 leading-relaxed">
            Seguimos LGPD, armazenamos dados sensíveis com criptografia e adotamos fluxos clínicos alinhados à legislação. Não incentivamos uso recreativo e todo acesso é feito com consentimento claro.
          </p>
        </div>

        <div className="space-y-3">
          {badges.map((badge, index) => (
            <motion.div
              key={badge}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl p-4"
            >
              <span className="w-8 h-8 rounded-full bg-white/20 text-cinza-escuro flex items-center justify-center text-sm font-semibold">
                ✓
              </span>
              <p className="text-sm text-off-white">{badge}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
