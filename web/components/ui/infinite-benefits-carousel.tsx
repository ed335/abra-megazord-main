"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { 
  Stethoscope, 
  Shield, 
  Clock, 
  Users, 
  FileCheck, 
  HeadphonesIcon, 
  BookOpen, 
  Scale, 
  Heart, 
  Wallet,
  Video,
  Award,
  Globe
} from "lucide-react";
import CannabisLeaf from "@/components/icons/CannabisLeaf";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const benefits: Benefit[] = [
  {
    icon: <Stethoscope className="w-6 h-6" />,
    title: "Médicos Especializados",
    description: "Profissionais com experiência comprovada em cannabis medicinal",
    color: "bg-emerald-500",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "100% Legal e Seguro",
    description: "Tratamento regulamentado pela ANVISA com total segurança jurídica",
    color: "bg-blue-500",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Atendimento em 48h",
    description: "Agilidade no agendamento e emissão de prescrições",
    color: "bg-amber-500",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Teleconsulta",
    description: "Consultas por vídeo no conforto da sua casa",
    color: "bg-purple-500",
  },
  {
    icon: <FileCheck className="w-6 h-6" />,
    title: "Receita Digital",
    description: "Prescrição válida em todo território nacional",
    color: "bg-rose-500",
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6" />,
    title: "Suporte via WhatsApp",
    description: "Atendimento humanizado para tirar suas dúvidas",
    color: "bg-teal-500",
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Conteúdo Educativo",
    description: "Material científico exclusivo sobre cannabis medicinal",
    color: "bg-indigo-500",
  },
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Orientação Jurídica",
    description: "Apoio sobre legislação e processo de importação",
    color: "bg-cyan-500",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Comunidade Ativa",
    description: "Troca de experiências com outros pacientes",
    color: "bg-orange-500",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Preços Acessíveis",
    description: "Consultas com valores justos e parcelamento",
    color: "bg-green-500",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Acompanhamento Contínuo",
    description: "Suporte durante todo o seu tratamento",
    color: "bg-pink-500",
  },
  {
    icon: <CannabisLeaf className="" size={24} />,
    title: "Produtos de Qualidade",
    description: "Indicação de fornecedores confiáveis e certificados",
    color: "bg-lime-500",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Carteirinha Digital",
    description: "Identificação oficial de associado ABRACANM",
    color: "bg-yellow-500",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Rede Nacional",
    description: "Atendimento em todo o Brasil via telemedicina",
    color: "bg-sky-500",
  },
];

function BenefitCard({ benefit }: { benefit: Benefit }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="flex-shrink-0 w-[280px] md:w-[320px] h-[180px] md:h-[200px] mx-2 perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        className="w-full h-full rounded-2xl bg-white border border-gray-100 shadow-lg p-5 md:p-6 relative overflow-hidden cursor-pointer"
        animate={{
          rotateY: isHovered ? 5 : 0,
          rotateX: isHovered ? -5 : 0,
          scale: isHovered ? 1.05 : 1,
          z: isHovered ? 50 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={`absolute top-0 right-0 w-32 h-32 ${benefit.color} opacity-10 rounded-full blur-2xl transform translate-x-10 -translate-y-10`}
        />
        
        <div className={`w-12 h-12 ${benefit.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
          {benefit.icon}
        </div>
        
        <h3 className="font-bold text-gray-900 text-base md:text-lg mb-2 line-clamp-1">
          {benefit.title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
          {benefit.description}
        </p>

        <motion.div
          className={`absolute bottom-0 left-0 h-1 ${benefit.color}`}
          initial={{ width: "0%" }}
          animate={{ width: isHovered ? "100%" : "0%" }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}

export function InfiniteBenefitsCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const controls = useAnimationControls();
  
  const duplicatedBenefits = [...benefits, ...benefits, ...benefits];

  useEffect(() => {
    const startAnimation = async () => {
      if (!containerRef.current) return;
      
      const cardWidth = 320 + 16;
      const totalWidth = benefits.length * cardWidth;
      
      await controls.start({
        x: -totalWidth,
        transition: {
          duration: 40,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        },
      });
    };

    if (!isPaused) {
      startAnimation();
    } else {
      controls.stop();
    }
  }, [isPaused, controls]);

  return (
    <div className="w-full overflow-hidden py-8">
      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        
        <motion.div
          ref={containerRef}
          className="flex"
          animate={controls}
        >
          {duplicatedBenefits.map((benefit, index) => (
            <BenefitCard key={`${benefit.title}-${index}`} benefit={benefit} />
          ))}
        </motion.div>
      </div>
      
      <div className="flex justify-center mt-6 gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-[#3FA174] rounded-full animate-pulse" />
          <span>Passe o mouse para pausar</span>
        </div>
      </div>
    </div>
  );
}
