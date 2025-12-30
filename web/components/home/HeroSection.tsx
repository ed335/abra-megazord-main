'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, BookOpen, Ban, User, Activity, QrCode } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();


  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-verde-claro rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-dourado rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{ y: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Conteúdo */}
      <div
        className="relative z-10 max-w-6xl mx-auto flex flex-col gap-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* Coluna texto */}
          <div className="text-center lg:text-left space-y-4 lg:space-y-5 flex flex-col justify-center">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-verde-claro/10 border border-verde-claro rounded-full">
                <Image
                  src="https://abracann.org.br/_next/image?url=%2Flogo-header.png&w=256&q=75"
                  alt="ABRACANM"
                  width={88}
                  height={28}
                  className="object-contain h-7 w-auto"
                />
                <span className="text-sm font-medium text-verde-oliva">Cannabis Medicinal</span>
              </div>
            </div>

            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-cinza-escuro mb-4 leading-tight max-w-2xl"
            >
              Acesso seguro à{' '}
              <span className="bg-gradient-to-r from-verde-oliva to-verde-claro bg-clip-text text-transparent">
                Cannabis Medicinal
              </span>
            </h1>

            <p
              className="text-base sm:text-lg text-cinza-medio mb-6 leading-relaxed max-w-2xl"
            >
              A ABRACANM é uma associação que acolhe pacientes em busca de qualidade de vida através da medicina canábica. 
              Conectamos você a prescritores qualificados, organizamos sua documentação e acompanhamos seu tratamento 
              com segurança, ciência e humanidade.
            </p>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group"
                  onClick={() => router.push('/cadastro')}
                >
                  Quero me Associar
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    const target = document.getElementById('como-funciona');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      router.push('/#como-funciona');
                    }
                  }}
                >
                  Saiba Como Funciona
                </Button>
              </div>
            </div>
          </div>

          {/* Card do paciente */}
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-cinza-claro/60 rounded-2xl p-6 shadow-lg max-w-md mx-auto w-full self-center lg:self-center"
            whileHover={{ y: -4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-verde-claro/30 flex items-center justify-center text-verde-oliva">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-cinza-medio">Paciente</p>
                  <p className="text-lg font-semibold text-cinza-escuro">Maria Oliveira</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-verde-claro/20 text-verde-oliva border-verde-claro/30">
                Tratamento Ativo
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-cinza-escuro">
              <div className="p-3 rounded-lg bg-off-white border border-cinza-claro">
                <p className="text-xs text-cinza-medio">Prescritor</p>
                <p className="font-semibold">Dr. João Silva</p>
                <p className="text-xs text-cinza-medio">CRM 123456</p>
              </div>
              <div className="p-3 rounded-lg bg-off-white border border-cinza-claro">
                <p className="text-xs text-cinza-medio">Última atualização</p>
                <p className="font-semibold">12 Mar 2025</p>
                <p className="text-xs text-cinza-medio">Próximo check-in: 30 dias</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-verde-oliva/10 border border-verde-oliva/30">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-verde-oliva" />
                <div className="text-sm">
                  <p className="font-semibold text-cinza-escuro">Cartão ABRACANM</p>
                  <p className="text-xs text-cinza-medio">Prescrição digital e documentos</p>
                </div>
              </div>
              <div className="w-16 h-16 border border-cinza-claro rounded-lg flex items-center justify-center bg-white">
                <QrCode className="w-10 h-10 text-cinza-escuro" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badges abaixo do hero */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 lg:gap-4 max-w-5xl w-full mx-auto"
        >
          {[
            { icon: ShieldCheck, label: 'LGPD + consentimento claro' },
            { icon: BookOpen, label: 'Baseado em ciência, não em promessa' },
            { icon: Ban, label: 'Não vendemos produto; não é recreativo' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-off-white border border-cinza-claro text-sm text-cinza-escuro shadow-sm justify-center"
              >
                <Icon className="w-4 h-4 text-verde-oliva" aria-hidden />
                {item.label}
              </span>
            );
          })}
        </div>

        {/* Stats abaixo do hero */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl mx-auto">
          {[
            { number: '500+', label: 'Pacientes em acompanhamento', desc: 'Fluxos orientados e suporte contínuo.' },
            { number: '150+', label: 'Prescritores habilitados e validados', desc: 'CRM verificado e emissão segura.' },
            { number: '99,9%', label: 'Disponibilidade da plataforma', desc: 'Infra segura para seus documentos.' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              className="text-center border border-cinza-claro rounded-xl p-5 bg-white/80 backdrop-blur"
            >
              <p className="text-3xl sm:text-4xl font-bold text-verde-oliva">
                {stat.number}
              </p>
              <p className="text-sm text-cinza-escuro mt-1 font-semibold">{stat.label}</p>
              <p className="text-xs text-cinza-medio mt-1">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
