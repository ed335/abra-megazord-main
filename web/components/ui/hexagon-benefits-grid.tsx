"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface Benefit {
  title: string;
  description: string;
}

interface HexagonBenefitsGridProps {
  benefits?: Benefit[];
  title?: string;
  subtitle?: string;
  lightColor?: string;
}

const defaultBenefits: Benefit[] = [
  { title: "Médicos especializados", description: "Profissionais experientes em cannabis medicinal" },
  { title: "Suporte contínuo", description: "Acompanhamento via WhatsApp para dúvidas" },
  { title: "Preços acessíveis", description: "Consultas com desconto exclusivo" },
  { title: "Conteúdo educativo", description: "Material científico sobre cannabis" },
  { title: "Orientação jurídica", description: "Apoio sobre legislação e importação" },
  { title: "Comunidade ativa", description: "Troca de experiências com outros pacientes" },
];

export function HexagonBenefitsGrid({
  benefits = defaultBenefits,
  title = "Por que escolher a ABRACANM?",
  subtitle = "Benefícios exclusivos para nossos associados.",
  lightColor = "#A8C686",
}: HexagonBenefitsGridProps) {
  return (
    <div className="relative w-full max-w-6xl mx-auto py-16 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="hexPattern" width="28" height="49" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
            <path
              d="M14,0 L28,8 L28,24 L14,32 L0,24 L0,8 Z M14,33 L28,41 L28,57 L14,65 L0,57 L0,41 Z M0,0 L0,0"
              fill="none"
              stroke={lightColor}
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="text-4xl sm:text-5xl font-semibold text-white mb-4 tracking-tight">
          {title}
        </h2>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      <div className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="relative">
              <svg
                className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                viewBox="0 0 200 100"
                preserveAspectRatio="none"
              >
                <polygon
                  points="20,0 180,0 200,50 180,100 20,100 0,50"
                  fill="none"
                  stroke={lightColor}
                  strokeWidth="1"
                  strokeOpacity="0.5"
                />
              </svg>

              <div
                className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"
                style={{ backgroundColor: `${lightColor}20` }}
              />

              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <motion.div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${lightColor}15` }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle className="w-5 h-5" style={{ color: lightColor }} />
                    </motion.div>
                    
                    <motion.div
                      className="absolute inset-0 rounded-lg"
                      style={{ border: `1px solid ${lightColor}` }}
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0, 0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#A8C686] transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 rounded-full"
                  style={{ backgroundColor: lightColor }}
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            cx={200 + i * 150}
            cy={100 + (i % 2) * 400}
            r="3"
            fill={lightColor}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -20, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>

      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-[#1d1d1f] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#1d1d1f] to-transparent pointer-events-none" />
    </div>
  );
}

export default HexagonBenefitsGrid;
