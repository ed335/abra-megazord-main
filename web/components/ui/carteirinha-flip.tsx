'use client'

import { useState } from "react"
import { User, Shield, Star, CheckCircle, QrCode, RotateCcw } from "lucide-react"
import CannabisLeaf from "@/components/icons/CannabisLeaf"
import { motion } from "framer-motion"
import { cn } from '@/lib/utils'
import Image from "next/image"

interface AssociadoData {
  nome: string
  matricula: string
  cpf?: string
  plano: string
  validade: string
  foto?: string
  status: 'ativo' | 'pendente' | 'inativo'
  nascimento?: string
}

interface CarteirinhaFlipProps {
  associado: AssociadoData
  className?: string
}

export function CarteirinhaFlip({ associado, className }: CarteirinhaFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const statusConfig = {
    ativo: { color: 'text-green-600', bg: 'bg-green-500', label: 'Ativo' },
    pendente: { color: 'text-amber-600', bg: 'bg-amber-500', label: 'Pendente' },
    inativo: { color: 'text-red-600', bg: 'bg-red-500', label: 'Inativo' }
  }

  const planoBadge = {
    'Plano Essencial': { color: 'text-gray-600', icon: null },
    'Plano Premium': { color: 'text-amber-500', icon: Star },
    'Plano Família': { color: 'text-blue-500', icon: null },
  }

  const status = statusConfig[associado.status]
  const planoConfig = planoBadge[associado.plano as keyof typeof planoBadge] || planoBadge['Plano Essencial']

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <div 
        className="relative cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1200px" }}
      >
        <motion.div
          className="relative w-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80, damping: 15 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-2xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute -top-1 left-3 right-3 h-6 md:h-8 rounded-t-xl md:rounded-t-2xl bg-gradient-to-b from-[#4CAF50] to-[#43A047] -z-10" />
            
            <div className="bg-gradient-to-r from-[#3FA174] to-[#2D8B5F] p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-[9px] md:text-[11px] uppercase tracking-widest font-medium">Associação Brasileira</p>
                  <p className="text-white text-sm md:text-base font-bold tracking-wide">ABRACANM</p>
                </div>
                <div className="flex items-center">
                  <CannabisLeaf className="text-white/90" size={36} />
                </div>
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="relative w-20 h-24 md:w-24 md:h-28 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-[#3FA174] flex items-center justify-center overflow-hidden">
                    {associado.foto ? (
                      <Image
                        src={associado.foto}
                        alt="Foto do Associado"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 md:w-12 md:h-12 text-gray-300" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-3">
                    <p className="text-gray-400 text-[8px] md:text-[9px] uppercase tracking-wider">Nome Completo</p>
                    <p className="text-[#1B4332] text-sm md:text-base font-bold truncate">{associado.nome}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Nº Registro</p>
                      <p className="text-[#1B4332] text-[11px] md:text-xs font-semibold">{associado.matricula}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Categoria</p>
                      <div className="flex items-center gap-1">
                        {planoConfig.icon && <planoConfig.icon className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-500 fill-amber-500" />}
                        <p className={cn("text-[11px] md:text-xs font-bold", planoConfig.color)}>{associado.plano.replace('Plano ', '').toUpperCase()}</p>
                      </div>
                    </div>
                    {associado.nascimento && (
                      <div>
                        <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Nascimento</p>
                        <p className="text-[#1B4332] text-[11px] md:text-xs font-semibold">{associado.nascimento}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-400 text-[7px] md:text-[8px] uppercase tracking-wider">Validade</p>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3 text-[#3FA174]" />
                        <p className="text-[#3FA174] text-[11px] md:text-xs font-bold">{associado.validade}</p>
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
                    <QrCode className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] text-gray-400 uppercase">QR Code</p>
                    <p className="text-[10px] md:text-[11px] text-gray-600 font-medium">Verificação</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] md:text-[9px] text-gray-400 uppercase">Status</p>
                  <div className="flex items-center gap-1">
                    <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full animate-pulse", status.bg)} />
                    <p className={cn("text-[10px] md:text-[11px] font-semibold", status.color)}>{status.label}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-[#2D8B5F] via-[#3FA174] to-[#1B4332] shadow-2xl"
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
            }}
          >
            <div className="absolute top-8 left-0 right-0 h-10 bg-[#1d1d1f]" />
            
            <div className="h-full flex flex-col p-4 md:p-5 pt-20">
              <div className="bg-white/95 rounded-xl p-3 md:p-4 mb-3 shadow-lg">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-wider mb-1">Plano Ativo</p>
                    <p className="text-xs md:text-sm font-bold text-[#1B4332] truncate">{associado.plano}</p>
                    <p className="text-[9px] md:text-[10px] text-gray-500 mt-1">Válido até {associado.validade}</p>
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[#1d1d1f] rounded-xl flex items-center justify-center p-1.5 md:p-2 flex-shrink-0">
                    <div className="w-full h-full bg-white rounded-lg flex items-center justify-center">
                      <QrCode className="w-10 h-10 md:w-12 md:h-12 text-[#1d1d1f]" />
                    </div>
                  </div>
                </div>
              </div>

              {associado.cpf && (
                <div className="bg-white/20 rounded-lg p-2.5 md:p-3 mb-3">
                  <p className="text-[8px] md:text-[9px] text-white/60 uppercase tracking-wider">CPF</p>
                  <p className="text-white font-mono text-xs md:text-sm">{associado.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}</p>
                </div>
              )}

              <div className="flex-1 flex flex-col justify-end">
                <div className="text-center space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/70" />
                    <p className="text-white/90 text-[10px] md:text-[11px] font-medium">Documento Oficial ABRACANM</p>
                  </div>
                  <p className="text-white/60 text-[8px] md:text-[9px] leading-relaxed px-2 md:px-4">
                    Esta carteira é pessoal e intransferível.
                  </p>
                  <p className="text-white/40 text-[7px] md:text-[8px]">
                    www.abracanm.org.br • contato@abracanm.org.br
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div 
        className="flex items-center justify-center gap-2 mt-4 text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <RotateCcw className="w-4 h-4" />
        <p className="text-sm">Toque no cartão para virar</p>
      </motion.div>
    </div>
  )
}
