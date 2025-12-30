"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CannabisLeaf from "@/components/icons/CannabisLeaf";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CallToActionBeaconProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  lightColor?: string;
}

export function CallToActionBeacon({
  title = "Comece sua jornada hoje",
  subtitle = "Associe-se à ABRACANM e tenha acesso a médicos especializados, suporte contínuo e preços acessíveis.",
  primaryButtonText = "Associar-se agora",
  primaryButtonHref = "/cadastro",
  secondaryButtonText = "Conhecer planos",
  secondaryButtonHref = "/planos",
  lightColor = "#A8C686",
}: CallToActionBeaconProps) {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-24 overflow-hidden">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="beaconGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="beaconGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lightColor} stopOpacity="0.3" />
            <stop offset="50%" stopColor={lightColor} stopOpacity="0.1" />
            <stop offset="100%" stopColor={lightColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <motion.circle
          cx="400"
          cy="200"
          r="150"
          fill="url(#beaconGradient)"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        />

        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            cx="400"
            cy="200"
            r="40"
            fill="none"
            stroke={lightColor}
            strokeWidth="1"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 5 + i, opacity: 0 }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeOut",
            }}
          />
        ))}

        {[
          { x: 220, y: 360, r: 2, yEnd: -250, dur: 3.5, delay: 0.2 },
          { x: 280, y: 380, r: 1.5, yEnd: -280, dur: 4, delay: 0.8 },
          { x: 340, y: 370, r: 2.5, yEnd: -220, dur: 3.2, delay: 1.5 },
          { x: 400, y: 390, r: 2, yEnd: -300, dur: 4.5, delay: 0.5 },
          { x: 460, y: 365, r: 1.8, yEnd: -260, dur: 3.8, delay: 2.1 },
          { x: 520, y: 385, r: 2.2, yEnd: -240, dur: 3.6, delay: 1.2 },
          { x: 580, y: 375, r: 1.6, yEnd: -290, dur: 4.2, delay: 2.8 },
          { x: 250, y: 400, r: 2.3, yEnd: -270, dur: 3.4, delay: 0.4 },
          { x: 310, y: 355, r: 1.7, yEnd: -310, dur: 4.8, delay: 1.8 },
          { x: 370, y: 410, r: 2.1, yEnd: -230, dur: 3.1, delay: 2.5 },
          { x: 430, y: 350, r: 1.9, yEnd: -285, dur: 4.3, delay: 0.9 },
          { x: 490, y: 395, r: 2.4, yEnd: -255, dur: 3.7, delay: 1.6 },
          { x: 550, y: 360, r: 1.4, yEnd: -320, dur: 4.6, delay: 2.3 },
        ].map((particle, i) => (
          <motion.circle
            key={`particle-${i}`}
            cx={particle.x}
            cy={particle.y}
            r={particle.r}
            fill={lightColor}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 0.8, 0],
              y: particle.yEnd,
            }}
            transition={{
              duration: particle.dur,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}

        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const length = 120;
          const x1 = 400 + Math.cos(angle) * 50;
          const y1 = 200 + Math.sin(angle) * 50;
          const x2 = 400 + Math.cos(angle) * (50 + length);
          const y2 = 200 + Math.sin(angle) * (50 + length);
          
          return (
            <motion.line
              key={`ray-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={lightColor}
              strokeWidth="1"
              strokeOpacity="0.2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              viewport={{ once: true }}
            />
          );
        })}

        <motion.circle
          cx="400"
          cy="200"
          r="35"
          fill={lightColor}
          fillOpacity="0.15"
        />
        <motion.circle
          cx="400"
          cy="200"
          r="25"
          fill={lightColor}
          fillOpacity="0.25"
        />
        <motion.circle
          cx="400"
          cy="200"
          r="15"
          fill={lightColor}
          filter="url(#beaconGlow)"
          initial={{ scale: 0.9 }}
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      <div className="relative z-10 text-center">
        <motion.div
          className="inline-block mb-8"
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
              style={{ backgroundColor: `${lightColor}20` }}
            >
              <CannabisLeaf className="" size={40} />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ border: `2px solid ${lightColor}` }}
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.h2
          className="text-4xl sm:text-5xl font-semibold text-white mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="text-xl text-white/60 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button
            asChild
            size="lg"
            className="relative overflow-hidden bg-[#6B7C59] hover:bg-[#5a6a4a] text-white px-10 py-6 text-lg rounded-full group"
          >
            <Link href={primaryButtonHref}>
              <span className="relative z-10 flex items-center">
                {primaryButtonText}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: lightColor }}
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1.5, opacity: 0.2 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-full"
          >
            <Link href={secondaryButtonHref}>
              {secondaryButtonText}
            </Link>
          </Button>
        </motion.div>
      </div>

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: lightColor }}
      />
    </div>
  );
}

export default CallToActionBeacon;
