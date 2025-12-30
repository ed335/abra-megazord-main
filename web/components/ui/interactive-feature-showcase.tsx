"use client";

import { motion } from "framer-motion";
import { Calendar, Video, FileText, MessageCircle, Shield, LucideIcon } from "lucide-react";
import Link from "next/link";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}

interface InteractiveFeatureShowcaseProps {
  features?: Feature[];
  title?: string;
  subtitle?: string;
  lightColor?: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: Calendar,
    title: "Agendamento Fácil",
    description: "Escolha o melhor horário para sua consulta em poucos cliques.",
    href: "/cadastro",
    cta: "Agendar agora",
  },
  {
    icon: Video,
    title: "Teleconsulta Segura",
    description: "Consulte com médicos prescritores de qualquer lugar, com total privacidade.",
    href: "/cadastro",
    cta: "Saiba mais",
  },
  {
    icon: FileText,
    title: "Receita Digital",
    description: "Prescrição emitida digitalmente, válida em todo território nacional.",
    href: "/planos",
    cta: "Ver planos",
  },
  {
    icon: MessageCircle,
    title: "Suporte Contínuo",
    description: "Tire dúvidas via WhatsApp com nossa equipe especializada.",
    href: "/contato",
    cta: "Falar conosco",
  },
  {
    icon: Shield,
    title: "100% Legal e Seguro",
    description: "Todo o processo segue a legislação brasileira vigente para cannabis medicinal.",
    href: "/educacao",
    cta: "Entenda a lei",
  },
];

export function InteractiveFeatureShowcase({
  features = defaultFeatures,
  title = "Como funciona",
  subtitle = "Tudo o que você precisa para iniciar seu tratamento de forma simples e segura.",
  lightColor = "#A8C686",
}: InteractiveFeatureShowcaseProps) {
  return (
    <div className="relative w-full max-w-6xl mx-auto py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      <div className="relative">
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="featureGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <motion.circle
            cx="500"
            cy="300"
            r="180"
            fill="none"
            stroke={lightColor}
            strokeOpacity="0.1"
            strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          />
          <motion.circle
            cx="500"
            cy="300"
            r="240"
            fill="none"
            stroke={lightColor}
            strokeOpacity="0.05"
            strokeWidth="1"
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          />

          {features.map((_, index) => {
            const angle = (index / features.length) * Math.PI * 2 - Math.PI / 2;
            const x = 500 + Math.cos(angle) * 200;
            const y = 300 + Math.sin(angle) * 200;
            
            return (
              <g key={index}>
                <motion.line
                  x1="500"
                  y1="300"
                  x2={x}
                  y2={y}
                  stroke={lightColor}
                  strokeOpacity="0.2"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  viewport={{ once: true }}
                />
                <motion.circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={lightColor}
                  filter="url(#featureGlow)"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                />
              </g>
            );
          })}

          <motion.circle
            cx="500"
            cy="300"
            r="30"
            fill={lightColor}
            fillOpacity="0.1"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          />
          <motion.circle
            cx="500"
            cy="300"
            r="20"
            fill={lightColor}
            fillOpacity="0.2"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          />
          <motion.circle
            cx="500"
            cy="300"
            r="10"
            fill={lightColor}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          />

          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx="500"
              cy="300"
              r="30"
              fill="none"
              stroke={lightColor}
              strokeWidth="1"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 1,
                ease: "easeOut",
              }}
            />
          ))}
        </svg>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={feature.href} className="block group">
                  <div className="relative overflow-hidden">
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
                      style={{ backgroundColor: `${lightColor}15` }}
                    />
                    
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10 group-hover:translate-y-[-4px]">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${lightColor}15` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: lightColor }} />
                          </div>
                          <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{ border: `1px solid ${lightColor}` }}
                            initial={{ scale: 1, opacity: 0 }}
                            whileHover={{ scale: 1.2, opacity: 0.5 }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#A8C686] transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-white/60 text-sm leading-relaxed mb-3">
                            {feature.description}
                          </p>
                          <span
                            className="inline-flex items-center text-sm font-medium transition-all duration-300 group-hover:gap-2"
                            style={{ color: lightColor }}
                          >
                            {feature.cta}
                            <motion.svg
                              className="w-4 h-4 ml-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              initial={{ x: 0 }}
                              whileHover={{ x: 4 }}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </motion.svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none" style={{ backgroundColor: lightColor }} />
    </div>
  );
}

export default InteractiveFeatureShowcase;
