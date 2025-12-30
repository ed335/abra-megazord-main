'use client';

import { motion } from 'framer-motion';

const articles = [
  { title: 'Uso medicinal e responsabilidade', tag: 'Educação', preview: 'Entenda quando a cannabis medicinal é indicada e quais cuidados tomar.' },
  { title: 'Como funciona a prescrição', tag: 'Prescrição', preview: 'Passo a passo da consulta ao cartão digital, com segurança e legalidade.' },
  { title: 'Segurança de dados na saúde', tag: 'LGPD', preview: 'Como protegemos seus dados sensíveis e o que significa consentimento informado.' },
];

export default function KnowledgeSection() {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm font-semibold text-verde-oliva uppercase tracking-wide">
            Conteúdo Educativo
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-cinza-escuro">
            Aprenda mais sobre Cannabis Medicinal de forma simples e segura
          </h2>
          <p className="text-base sm:text-lg text-cinza-medio max-w-3xl mx-auto">
            Orientações curadas por especialistas para pacientes e prescritores, com foco em segurança e clareza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="h-full border border-cinza-claro rounded-xl p-5 bg-off-white hover:shadow-md transition-all flex flex-col"
            >
              <span className="text-xs font-semibold text-verde-oliva uppercase tracking-wide mb-2">
                {article.tag}
              </span>
              <h3 className="text-lg font-semibold text-cinza-escuro mb-2">{article.title}</h3>
              <p className="text-sm text-cinza-medio leading-relaxed flex-1">{article.preview}</p>
              <a href="#" className="text-sm text-verde-oliva font-semibold mt-4 hover:underline">
                Ver mais →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
