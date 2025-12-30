'use client';

import { motion } from 'framer-motion';
import { BookOpen, Clock, ExternalLink, GraduationCap, Microscope, Scale, Pill, Play, FileText, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EducacaoPage() {
  const artigos = [
    {
      title: 'O que é Cannabis Medicinal?',
      description: 'Entenda os fundamentos científicos do uso terapêutico da cannabis e como ela atua no corpo humano.',
      category: 'Introdução',
      icon: BookOpen,
      readTime: '5 min',
      color: 'bg-verde-claro/20 text-verde-oliva',
    },
    {
      title: 'Sistema Endocanabinoide',
      description: 'Como nosso corpo interage naturalmente com os canabinoides através de receptores CB1 e CB2.',
      category: 'Ciência',
      icon: Microscope,
      readTime: '8 min',
      color: 'bg-info/20 text-info',
    },
    {
      title: 'CBD vs THC: Diferenças e Aplicações',
      description: 'Conheça os principais compostos da cannabis e suas indicações terapêuticas específicas.',
      category: 'Tratamento',
      icon: Pill,
      readTime: '6 min',
      color: 'bg-alerta/20 text-alerta',
    },
    {
      title: 'Como Funciona a Prescrição no Brasil',
      description: 'Regulamentação da ANVISA, documentos necessários e passos para obter seu tratamento legalmente.',
      category: 'Legislação',
      icon: Scale,
      readTime: '7 min',
      color: 'bg-erro/10 text-erro',
    },
    {
      title: 'Formas de Administração',
      description: 'Óleos, cápsulas, vaporizadores e outras formas: qual é a melhor para o seu caso?',
      category: 'Tratamento',
      icon: FileText,
      readTime: '5 min',
      color: 'bg-alerta/20 text-alerta',
    },
    {
      title: 'Depoimentos de Pacientes',
      description: 'Histórias reais de pacientes que encontraram qualidade de vida com a cannabis medicinal.',
      category: 'Comunidade',
      icon: Users,
      readTime: '10 min',
      color: 'bg-sucesso/20 text-sucesso',
    },
  ];

  const videos = [
    {
      title: 'Introdução à Cannabis Medicinal',
      duration: '12:30',
      thumbnail: 'video-1',
    },
    {
      title: 'Como funciona o tratamento?',
      duration: '8:45',
      thumbnail: 'video-2',
    },
    {
      title: 'Mitos e Verdades',
      duration: '15:20',
      thumbnail: 'video-3',
    },
  ];

  return (
    <main className="min-h-screen bg-[#fafaf8]">
      <section className="bg-white py-16 border-b border-cinza-claro">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-verde-claro/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-10 h-10 text-verde-oliva" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-cinza-escuro mb-4 tracking-tight">
              Educação em Cannabis Medicinal
            </h1>
            <p className="text-lg text-cinza-medio max-w-2xl mx-auto">
              Conteúdos baseados em ciência para ajudar você a entender melhor o tratamento. 
              Conhecimento é o primeiro passo para uma vida melhor.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-2xl font-semibold text-cinza-escuro mb-8"
        >
          Artigos em Destaque
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {artigos.map((artigo, index) => {
            const Icon = artigo.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-cinza-claro hover:border-verde-oliva/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${artigo.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex items-center gap-1 text-xs text-cinza-medio">
                        <Clock className="w-3 h-3" />
                        {artigo.readTime}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-verde-oliva bg-verde-claro/20 px-2 py-1 rounded">
                      {artigo.category}
                    </span>
                    <h3 className="font-semibold text-cinza-escuro mt-3 mb-2 group-hover:text-verde-oliva transition-colors">
                      {artigo.title}
                    </h3>
                    <p className="text-sm text-cinza-medio line-clamp-3">
                      {artigo.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-12 border-t border-b border-cinza-claro">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl font-semibold text-cinza-escuro mb-8"
          >
            Vídeos Educativos
          </motion.h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="aspect-video bg-cinza-claro rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="w-6 h-6 text-verde-oliva ml-1" />
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>
                <h3 className="font-medium text-cinza-escuro mt-3 group-hover:text-verde-oliva transition-colors">
                  {video.title}
                </h3>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-sm text-cinza-medio mt-8">
            Em breve: mais vídeos com especialistas e depoimentos de pacientes
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-verde-claro/10 border-verde-claro/30">
            <CardContent className="py-10 text-center">
              <GraduationCap className="w-12 h-12 text-verde-oliva mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-cinza-escuro mb-3">
                Novos conteúdos em breve
              </h2>
              <p className="text-cinza-medio mb-6 max-w-lg mx-auto">
                Nossa equipe científica está preparando novos materiais educativos. 
                Siga-nos nas redes sociais para receber atualizações.
              </p>
              <a 
                href="https://www.instagram.com/abracann_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-verde-oliva text-white px-6 py-3 rounded-lg font-medium hover:bg-verde-oliva/90 transition-colors"
              >
                Siga-nos no Instagram
                <ExternalLink className="w-4 h-4" />
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
