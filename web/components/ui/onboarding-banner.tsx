'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, User, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './button';

interface OnboardingBannerProps {
  userName: string;
  hasCpf: boolean;
  hasDocumento: boolean;
  hasEndereco: boolean;
}

export function OnboardingBanner({ 
  userName, 
  hasCpf, 
  hasDocumento, 
  hasEndereco 
}: OnboardingBannerProps) {
  const steps = [
    { label: 'CPF', done: hasCpf },
    { label: 'Endereço', done: hasEndereco },
    { label: 'Documento', done: hasDocumento },
  ];

  const completedSteps = steps.filter(s => s.done).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  if (progress === 100) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#3FA174] to-[#2d8a5f] rounded-2xl p-6 text-white mb-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5" />
            <h3 className="font-semibold text-lg">Complete seu cadastro, {userName.split(' ')[0]}!</h3>
          </div>
          <p className="text-white/80 text-sm mb-4">
            Finalize suas informações para desbloquear todos os recursos da plataforma.
          </p>
          
          <div className="flex items-center gap-3 mb-4">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  step.done 
                    ? 'bg-white text-[#3FA174]' 
                    : 'bg-white/20 text-white'
                }`}>
                  {step.done ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <span className={`text-sm ${step.done ? 'text-white' : 'text-white/70'}`}>
                  {step.label}
                </span>
                {idx < steps.length - 1 && (
                  <div className={`w-6 h-0.5 ${step.done ? 'bg-white' : 'bg-white/30'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/70">{progress}% concluído</p>
        </div>

        <Link href="/onboarding">
          <Button 
            className="bg-white text-[#3FA174] hover:bg-white/90 font-medium shadow-lg"
          >
            Continuar cadastro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
