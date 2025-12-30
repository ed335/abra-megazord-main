"use client";

import { motion } from "framer-motion";
import { 
  Leaf, 
  FileText,
  Video,
  CheckCircle,
  ArrowRight,
  Calendar,
  MessageCircle,
  Zap
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { HeroCarteirinha } from "@/components/ui/hero-carteirinha";
import { InfiniteBenefitsCarousel } from "@/components/ui/infinite-benefits-carousel";
import { FaqAccordion } from "@/components/ui/faq-chat-accordion";
import { FooterSection } from "@/components/ui/footer-section";
import { StatsSection } from "@/components/ui/stats-section";

const faqData = [
  {
    id: 1,
    question: "O tratamento com cannabis medicinal é legal no Brasil?",
    answer: "Sim! A ANVISA regulamenta o uso de produtos à base de cannabis para fins medicinais desde 2015. Com prescrição médica válida, você pode importar ou adquirir legalmente.",
    icon: "✅",
    iconPosition: "right" as const,
  },
  {
    id: 2,
    question: "Como funciona a teleconsulta?",
    answer: "A consulta é realizada por vídeo com médicos especializados em cannabis medicinal. Você recebe orientação personalizada e, se indicado, a prescrição digital válida em todo o Brasil.",
  },
  {
    id: 3,
    question: "Quanto tempo leva para começar o tratamento?",
    answer: "Após a consulta, você recebe a prescrição em até 48 horas. O processo de importação pode levar de 15 a 30 dias, dependendo do produto e fornecedor escolhido.",
    icon: "⏰",
    iconPosition: "left" as const,
  },
  {
    id: 4,
    question: "Quais condições podem ser tratadas com cannabis medicinal?",
    answer: "Diversas condições como dor crônica, epilepsia, ansiedade, insônia, fibromialgia, Parkinson, Alzheimer, autismo e muitas outras podem se beneficiar do tratamento.",
  },
  {
    id: 5,
    question: "A ABRACANM oferece suporte após a consulta?",
    answer: "Sim! Oferecemos acompanhamento contínuo via WhatsApp, orientação sobre importação, e acesso a conteúdo educativo exclusivo para nossos associados.",
    icon: "💚",
    iconPosition: "right" as const,
  },
];

const testimonials = [
  {
    id: 1,
    name: "Maria S.",
    role: "Paciente",
    company: "Dor Crônica",
    content: "Depois de anos sofrendo com dores, finalmente encontrei qualidade de vida. A equipe da ABRACANM me acolheu desde o primeiro contato.",
    rating: 5,
    avatar: "",
  },
  {
    id: 2,
    name: "João P.",
    role: "Paciente",
    company: "Ansiedade",
    content: "O tratamento mudou minha vida. Hoje durmo melhor, trabalho melhor e vivo melhor. Gratidão a toda equipe.",
    rating: 5,
    avatar: "",
  },
  {
    id: 3,
    name: "Ana C.",
    role: "Mãe de paciente",
    company: "Epilepsia",
    content: "Minha filha tinha crises diárias. Com o tratamento, as crises reduziram drasticamente. A ABRACANM foi fundamental nessa conquista.",
    rating: 5,
    avatar: "",
  },
  {
    id: 4,
    name: "Carlos R.",
    role: "Paciente",
    company: "Fibromialgia",
    content: "Encontrei na ABRACANM o suporte que precisava. Os médicos são atenciosos e o processo de obtenção da receita foi muito tranquilo.",
    rating: 5,
    avatar: "",
  },
];

const journeyItems = [
  {
    id: 1,
    title: "Cadastro",
    description: "Preencha seus dados e envie documentação",
    date: "Passo 1",
    icon: <FileText className="size-4" />,
  },
  {
    id: 2,
    title: "Pré-anamnese",
    description: "Responda o questionário de saúde online",
    date: "Passo 2",
    icon: <CheckCircle className="size-4" />,
  },
  {
    id: 3,
    title: "Teleconsulta",
    description: "Consulta por vídeo com médico prescritor",
    date: "Passo 3",
    icon: <Video className="size-4" />,
  },
  {
    id: 4,
    title: "Tratamento",
    description: "Receba sua receita e inicie o tratamento",
    date: "Passo 4",
    icon: <Leaf className="size-4" />,
  },
];

const conditions = [
  "Ansiedade", "Dor Crônica", "Insônia", "Depressão", "Epilepsia",
  "Fibromialgia", "Autismo", "Parkinson", "Alzheimer", "TDAH",
  "Síndrome do Pânico", "Estresse Pós-Traumático"
];

const services = [
  {
    icon: Calendar,
    title: "Agendamento Fácil",
    description: "Escolha o melhor horário para sua consulta em poucos cliques.",
  },
  {
    icon: Video,
    title: "Teleconsulta Segura",
    description: "Consulte com médicos prescritores de qualquer lugar, com total privacidade.",
  },
  {
    icon: FileText,
    title: "Receita Digital",
    description: "Prescrição emitida digitalmente, válida em todo território nacional.",
  },
  {
    icon: MessageCircle,
    title: "Suporte Contínuo",
    description: "Tire dúvidas via WhatsApp com nossa equipe especializada.",
  },
];


export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white">

      {/* Hero Section com Scroll Animation e Elementos Flutuantes */}
      <section id="inicio" className="relative w-full bg-gradient-to-b from-[#FAFBFC] to-white">
        {/* Floating Elements - Desktop - Positioned relative to section */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute left-2 md:left-4 lg:left-8 xl:left-16 top-[42%] md:top-[45%] z-20"
          >
            <div className="bg-rose-100 text-rose-600 px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium shadow-lg flex items-center gap-1.5 md:gap-2">
              <Zap className="w-3 h-3 md:w-4 md:h-4" />
              Atendimento Rápido
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="absolute left-1 md:left-2 lg:left-6 xl:left-12 top-[54%] md:top-[56%] z-20"
          >
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-3 lg:p-4 border border-gray-100">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">Limite de Consultas</p>
              <p className="text-xs md:text-sm lg:text-base font-bold text-gray-900">Ilimitado</p>
              <div className="mt-1.5 md:mt-2 h-1.5 md:h-2 bg-gray-100 rounded-full overflow-hidden w-20 md:w-24 lg:w-28">
                <div className="h-full w-3/4 bg-blue-500 rounded-full" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute left-2 md:left-6 lg:left-10 xl:left-20 top-[68%] md:top-[70%] z-20"
          >
            <div className="bg-blue-500 text-white rounded-xl shadow-lg p-2.5 md:p-3 lg:p-3.5 flex items-center gap-2 md:gap-2.5">
              <div className="w-7 h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <span className="font-medium text-xs md:text-sm">Consulta Realizada!</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="absolute right-2 md:right-4 lg:right-8 xl:right-16 top-[40%] md:top-[43%] z-20"
          >
            <div className="bg-[#3FA174] text-white px-3 md:px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium shadow-lg">
              100% Legal
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="absolute right-1 md:right-2 lg:right-6 xl:right-12 top-[52%] md:top-[54%] z-20"
          >
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-3 lg:p-4 border border-gray-100">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">Satisfação</p>
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="text-rose-500 text-xs md:text-sm">+</span>
                <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">98%</p>
              </div>
              <div className="flex gap-1 md:gap-1.5 mt-1.5 md:mt-2">
                <div className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-green-100 rounded flex items-center justify-center text-[10px] md:text-xs text-green-600">↓</div>
                <div className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-purple-100 rounded flex items-center justify-center text-[10px] md:text-xs text-purple-600">↑</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute right-2 md:right-6 lg:right-10 xl:right-20 top-[68%] md:top-[70%] z-20"
          >
            <div className="bg-white rounded-xl shadow-lg p-2.5 md:p-3 lg:p-4 border border-gray-100">
              <p className="text-[10px] md:text-xs text-gray-400 mb-1">Pacientes Atendidos</p>
              <p className="text-base md:text-lg lg:text-xl font-bold text-[#3FA174]">+5.000</p>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col items-center pt-8 md:pt-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 tracking-tight text-gray-900 leading-[1.1]">
              Simples. <span className="text-[#3FA174]">Seguro.</span>
              <br />
              Feito para Você.
            </h1>
            
            <p className="text-gray-500 text-base lg:text-lg mb-8 max-w-xl mx-auto">
              Conectamos você a médicos prescritores especializados.
              Consultas por vídeo, receita digital válida em todo o Brasil.
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                asChild
                className="bg-[#3FA174] hover:bg-[#359966] text-white px-6 py-5 text-sm font-medium rounded-full"
              >
                <Link href="/cadastro">
                  Agendar consulta
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-5 text-sm font-medium rounded-full"
              >
                <Link href="/planos">
                  Como funciona
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="relative z-30 w-full flex justify-center py-8 md:py-16">
            <HeroCarteirinha />
          </div>
        </div>

        {/* Mobile Floating Badges */}
        <div className="flex md:hidden justify-center gap-2 mb-8 flex-wrap px-4">
          <span className="bg-rose-100 text-rose-600 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Atendimento Rápido
          </span>
          <span className="bg-[#3FA174] text-white px-3 py-1.5 rounded-full text-xs font-medium">
            100% Legal
          </span>
          <span className="bg-blue-500 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Consulta Realizada
          </span>
        </div>

        <StatsSection />
      </section>

      {/* Conditions Section - Pill Tags */}
      <section id="condicoes" className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Para qual condição você busca tratamento?
            </h2>
            <p className="text-gray-600">
              Selecione sua condição e inicie seu tratamento com cannabis medicinal
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3"
          >
            {conditions.map((condition) => (
              <Link
                key={condition}
                href={`/cadastro?condicao=${encodeURIComponent(condition)}`}
                className="px-5 py-2.5 rounded-full bg-gray-100 text-gray-700 hover:bg-[#3FA174] hover:text-white transition-all duration-200 text-sm font-medium"
              >
                {condition}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl text-center text-gray-700 leading-relaxed"
          >
            Democratizamos o acesso a tratamentos com cannabis medicinal no Brasil, 
            conectando pacientes a médicos prescritores especializados de forma{" "}
            <span className="font-bold text-gray-900">100% legal e segura</span>.
          </motion.p>
        </div>
      </section>

      {/* How it Works - Timeline */}
      <section id="como-funciona" className="py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como funciona
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Em poucos passos, você inicia seu tratamento com cannabis medicinal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {journeyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#3FA174] text-white flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.id}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button
              asChild
              size="lg"
              className="bg-[#3FA174] hover:bg-[#359966] text-white px-8 py-6 text-lg font-medium rounded-xl"
            >
              <Link href="/cadastro">
                Começar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="servicos" className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos serviços
            </h2>
            <p className="text-gray-600 text-lg">
              Tudo que você precisa para seu tratamento em um só lugar
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-[#3FA174]/10 text-[#3FA174] flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Carousel - Infinite 3D */}
      <section className="py-20 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a ABRACANM?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Mais de 14 benefícios exclusivos para nossos associados
            </p>
          </motion.div>
        </div>
        
        <InfiniteBenefitsCarousel />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-600 text-lg">
              Tire suas dúvidas sobre o tratamento com cannabis medicinal
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <FaqAccordion 
              data={faqData}
              className="max-w-3xl mx-auto"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nossos pacientes dizem
            </h2>
            <p className="text-gray-600 text-lg">
              Histórias reais de quem transformou sua qualidade de vida
            </p>
          </motion.div>

          <AnimatedTestimonials testimonials={testimonials} />
        </div>
      </section>

      {/* Nossa Missão Section */}
      <section className="py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#3FA174] text-sm font-semibold tracking-wider uppercase mb-4 block">
              NOSSA MISSÃO
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Quebrar barreiras e tabus com
              <br />
              <span className="text-[#3FA174]">ciência</span>,{" "}
              <span className="text-[#3FA174]">segurança</span> e{" "}
              <span className="text-[#3FA174]">humanidade</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <span className="text-7xl lg:text-8xl font-bold text-gray-100 block mb-4">01</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Cuidado humanizado</h3>
              <p className="text-gray-600 leading-relaxed">
                Acolhemos cada paciente de forma única, oferecendo suporte completo no acesso ao tratamento para você e sua família.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <span className="text-7xl lg:text-8xl font-bold text-gray-100 block mb-4">02</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ciência e educação</h3>
              <p className="text-gray-600 leading-relaxed">
                Trabalhamos com base em evidências científicas, promovendo capacitação contínua e informação de qualidade.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <span className="text-7xl lg:text-8xl font-bold text-gray-100 block mb-4">03</span>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunidade ativa</h3>
              <p className="text-gray-600 leading-relaxed">
                Construímos uma rede de apoio onde pacientes compartilham experiências e se fortalecem juntos.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link 
              href="/sobre" 
              className="inline-flex items-center gap-2 text-[#3FA174] font-semibold hover:text-[#2D7A5A] transition-colors duration-200"
            >
              Conheça nossa história
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
