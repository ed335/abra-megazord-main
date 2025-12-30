"use client";

import { motion } from "framer-motion";
import { Heart, BookOpen, Users, LucideIcon } from "lucide-react";

interface MissionItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface AnimatedMissionCardsProps {
  items?: MissionItem[];
  title?: string;
  subtitle?: string;
  lightColor?: string;
}

const defaultItems: MissionItem[] = [
  {
    icon: Heart,
    title: "Cuidado humanizado",
    description: "Apoio completo aos pacientes e familiares no acesso ao tratamento",
  },
  {
    icon: BookOpen,
    title: "Ciência e educação",
    description: "Informação científica de qualidade e capacitação contínua",
  },
  {
    icon: Users,
    title: "Comunidade",
    description: "Rede de apoio e compartilhamento de experiências",
  },
];

export function AnimatedMissionCards({
  items = defaultItems,
  title = "Nossa missão",
  subtitle = "Acolhemos pacientes que buscam qualidade de vida através da cannabis medicinal.",
  lightColor = "#A8C686",
}: AnimatedMissionCardsProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto py-16">
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
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="missionLineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={lightColor} stopOpacity="0" />
              <stop offset="50%" stopColor={lightColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="missionLineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={lightColor} stopOpacity="0" />
              <stop offset="50%" stopColor={lightColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
            </linearGradient>
            <filter id="missionGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M 140 150 C 200 150, 260 80, 400 80"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 400 80 C 540 80, 600 150, 660 150"
            stroke="white"
            strokeOpacity="0.1"
            strokeWidth="2"
            fill="none"
          />

          <motion.circle
            cx="0"
            cy="0"
            r="6"
            fill={lightColor}
            filter="url(#missionGlow)"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 140 150 C 200 150, 260 80, 400 80"
            />
          </motion.circle>

          <motion.circle
            cx="0"
            cy="0"
            r="6"
            fill={lightColor}
            filter="url(#missionGlow)"
          >
            <animateMotion
              dur="3s"
              repeatCount="indefinite"
              path="M 400 80 C 540 80, 600 150, 660 150"
              begin="1.5s"
            />
          </motion.circle>

          <motion.circle
            cx="140"
            cy="150"
            r="8"
            fill="transparent"
            stroke={lightColor}
            strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle
            cx="400"
            cy="80"
            r="8"
            fill="transparent"
            stroke={lightColor}
            strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
          />
          <motion.circle
            cx="660"
            cy="150"
            r="8"
            fill="transparent"
            stroke={lightColor}
            strokeWidth="2"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
          />
        </svg>

        <div className="relative grid md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                className={`relative ${index === 1 ? "md:-mt-16" : ""}`}
              >
                <div className="relative group">
                  <div
                    className="absolute -inset-0.5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ backgroundColor: `${lightColor}20` }}
                  />
                  
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center transition-all duration-300 group-hover:border-white/20 group-hover:bg-white/10">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                      <div
                        className="absolute inset-0 rounded-full opacity-20"
                        style={{ backgroundColor: lightColor }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ border: `2px solid ${lightColor}` }}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 1.3, opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: index * 0.3 }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-10 h-10" style={{ color: lightColor }} />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/60 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: lightColor }} />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none" style={{ backgroundColor: lightColor }} />
    </div>
  );
}

export default AnimatedMissionCards;
