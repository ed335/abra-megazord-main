'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto bg-gradient-to-r from-verde-oliva to-verde-claro rounded-3xl p-12 sm:p-16 text-center shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-off-white mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Pronto para ter orientação segura?
        </motion.h2>

        <motion.p
          className="text-lg sm:text-xl text-off-white/90 mb-6 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Comece com um cadastro simples. Vamos caminhar ao seu lado, com ciência, ética e cuidado em cada passo.
        </motion.p>

        <motion.form
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            router.push('/cadastro');
          }}
        >
          <input
            type="email"
            required
            placeholder="seuemail@exemplo.com"
            className="w-full sm:w-80 px-4 py-3 rounded-lg border border-off-white/60 bg-white text-cinza-escuro placeholder:text-off-white/70 focus:outline-none focus:ring-2 focus:ring-off-white"
          />
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            className="bg-white text-verde-oliva hover:bg-off-white group w-full sm:w-auto font-semibold shadow-md"
          >
            Quero me cadastrar
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.form>

        <motion.div
          className="mt-4 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <button
            type="button"
            onClick={() => router.push('/pre-anamnese')}
            className="text-off-white font-medium underline underline-offset-4 hover:text-white transition-colors"
          >
            Preferir iniciar pela pré-anamnese guiada
          </button>
        </motion.div>

        <motion.p
          className="text-sm text-off-white/70 mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Seus dados de saúde são tratados com extremo cuidado, seguindo LGPD e verificação de identidade.
        </motion.p>
      </motion.div>
    </section>
  );
}
