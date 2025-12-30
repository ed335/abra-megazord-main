'use client'

import { User, Shield, Clock, Video, FileText, Heart, Star, CheckCircle } from "lucide-react"
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface HeroCarteirinhaProps {
  className?: string
}

const floatingElements = [
  { icon: Shield, label: "100% Legal", color: "bg-blue-500", position: "top-0 -left-16 md:-left-24" },
  { icon: Clock, label: "48h", color: "bg-amber-500", position: "top-8 -right-12 md:-right-20" },
  { icon: Video, label: "Teleconsulta", color: "bg-purple-500", position: "bottom-24 -left-14 md:-left-20" },
  { icon: FileText, label: "Receita Digital", color: "bg-rose-500", position: "bottom-16 -right-10 md:-right-16" },
  { icon: Heart, label: "Qualidade de Vida", color: "bg-green-500", position: "-bottom-4 left-1/4" },
]

export function HeroCarteirinha({ className }: HeroCarteirinhaProps) {
  return (
    <div className={cn("relative w-full max-w-[400px] md:max-w-[450px] mx-auto", className)}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative"
          style={{ 
            perspective: "1000px",
            transformStyle: "preserve-3d"
          }}
        >
          <div 
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-2xl"
            style={{ 
              transform: "rotateX(5deg) rotateY(-5deg)"
            }}
          >
            <div className="absolute -top-1 left-3 right-3 h-6 md:h-8 rounded-t-xl md:rounded-t-2xl bg-gradient-to-b from-[#4CAF50] to-[#43A047] -z-10" />
            
            <div className="bg-gradient-to-r from-[#3FA174] to-[#2D8B5F] p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[9px] md:text-[11px] uppercase tracking-widest font-medium">Associação Brasileira</p>
                  <p className="text-white text-sm md:text-base font-bold tracking-wide">ABRACANM</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22V12"/>
                    <path d="M12 12C12 12 8 10 6 6C6 6 10 7 12 12"/>
                    <path d="M12 12C12 12 16 10 18 6C18 6 14 7 12 12"/>
                    <path d="M12 12C12 12 6 8 2 8C2 8 6 11 12 12"/>
                    <path d="M12 12C12 12 18 8 22 8C22 8 18 11 12 12"/>
                    <path d="M12 12C12 12 10 6 12 2C12 2 14 6 12 12"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div 
                    className="w-20 h-24 md:w-24 md:h-28 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-[#3FA174] flex items-center justify-center overflow-hidden"
                  >
                    <User className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <p className="text-gray-400 text-[8px] md:text-[9px] uppercase tracking-wider">Nome Completo</p>
                    <p className="text-[#1B4332] text-sm md:text-base font-bold truncate">Maria Silva Santos</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Nº Registro</p>
                      <p className="text-[#1B4332] text-[11px] md:text-xs font-semibold">ABR-00001</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Categoria</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500 fill-amber-500" />
                        <p className="text-[#3FA174] text-[11px] md:text-xs font-bold">PREMIUM</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Nascimento</p>
                      <p className="text-[#1B4332] text-[11px] md:text-xs font-semibold">01/01/1990</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Validade</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#3FA174]" />
                        <p className="text-[#3FA174] text-[11px] md:text-xs font-bold">12/2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 md:px-5 pb-4 md:pb-5">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-3" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-[#3FA174] to-[#2D8B5F] flex items-center justify-center">
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13 2h-2v2h2v2h2v-4h2v-2h-4v2zm0-2v-2h2v2h-2zm-4 4h2v2h-2v-2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] text-gray-400 uppercase">QR Code</p>
                    <p className="text-[10px] md:text-[11px] text-gray-600 font-medium">Verificação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[9px] text-gray-400 uppercase">Status</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] md:text-[11px] text-green-600 font-semibold">Ativo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {floatingElements.map((element, index) => (
        <motion.div
          key={element.label}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            y: [0, index % 2 === 0 ? -6 : 6, 0]
          }}
          transition={{ 
            opacity: { duration: 0.5, delay: 0.8 + index * 0.1 },
            scale: { duration: 0.5, delay: 0.8 + index * 0.1 },
            y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }
          }}
          className={cn(
            "absolute hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100",
            element.position
          )}
        >
          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white", element.color)}>
            <element.icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{element.label}</span>
        </motion.div>
      ))}

      <div className="absolute -z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#3FA174]/5 to-transparent blur-[80px]" />
        <div className="absolute inset-12 rounded-full bg-gradient-to-tl from-amber-400/5 to-transparent blur-[60px]" />
      </div>
    </div>
  )
}
