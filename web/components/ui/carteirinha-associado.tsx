'use client'

import { useState } from "react"
import { Check, ChevronUp, Shield, Calendar, CreditCard, QrCode, User } from "lucide-react"
import CannabisLeaf from "@/components/icons/CannabisLeaf"
import { motion, AnimatePresence } from "framer-motion"
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
}

interface CarteirinhaAssociadoProps {
  associado: AssociadoData
  className?: string
  showDetails?: boolean
}

export function CarteirinhaAssociado({ 
  associado, 
  className,
  showDetails = true 
}: CarteirinhaAssociadoProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)

  const statusColors = {
    ativo: 'bg-[#6B7C59] text-white',
    pendente: 'bg-amber-500 text-white',
    inativo: 'bg-red-500 text-white'
  }

  const statusLabels = {
    ativo: 'Ativo',
    pendente: 'Pendente',
    inativo: 'Inativo'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-md mx-auto overflow-hidden rounded-3xl bg-white shadow-lg border border-[#e5e5e5]",
        className
      )}
    >
      <motion.div
        className="p-6 border-b border-[#e5e5e5] hover:bg-[#fafaf8] transition-colors duration-200"
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center">
          <motion.div
            className="relative w-14 h-14 mr-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6B7C59] to-[#4A5A3A] p-0.5">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                {associado.foto ? (
                  <Image
                    src={associado.foto}
                    alt="Foto do Associado"
                    fill
                    sizes="56px"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-[#6B7C59]" />
                )}
              </div>
            </div>
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1d1d1f]">{associado.nome}</h2>
              {associado.status === 'ativo' && (
                <motion.div
                  className="flex items-center justify-center w-5 h-5 bg-[#6B7C59] rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </div>
            <p className="text-[#86868b] text-sm">
              {associado.plano} • Mat. {associado.matricula}
            </p>
          </div>
          {showDetails && (
            <motion.button
              className="text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div animate={{ rotate: isOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
                <ChevronUp className="w-5 h-5" />
              </motion.div>
            </motion.button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 border-b border-[#e5e5e5]">
              <div 
                className="perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="relative w-full aspect-[1.586/1] preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Frente do Cartão */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl p-6 overflow-hidden backface-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      background: "linear-gradient(135deg, #6B7C59 0%, #4A5A3A 50%, #3d4a30 100%)"
                    }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    {/* Padrão decorativo */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/30" />
                      <div className="absolute top-8 right-8 w-24 h-24 rounded-full border border-white/20" />
                      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white/20" />
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <CannabisLeaf className="text-white" size={32} />
                          <div>
                            <div className="text-white font-bold text-lg tracking-wide">ABRACANM</div>
                            <div className="text-white/70 text-[10px] tracking-wider">
                              ASSOCIAÇÃO BRASILEIRA DE CANNABIS MEDICINAL
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium",
                          statusColors[associado.status]
                        )}>
                          {statusLabels[associado.status]}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-white/70 text-xs uppercase tracking-wider">Nome do Associado</div>
                        <div className="text-white font-semibold text-lg tracking-wide">
                          {associado.nome.toUpperCase()}
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-white/70 text-[10px] uppercase tracking-wider">Matrícula</div>
                          <div className="text-white font-mono text-base tracking-widest">
                            {associado.matricula}
                          </div>
                        </div>
                        <div>
                          <div className="text-white/70 text-[10px] uppercase tracking-wider">Validade</div>
                          <div className="text-white font-mono text-base">
                            {associado.validade}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-5 h-5 text-[#A8C686]" />
                          <CreditCard className="w-5 h-5 text-[#A8C686]" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Verso do Cartão */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl p-6 overflow-hidden backface-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "linear-gradient(135deg, #4A5A3A 0%, #3d4a30 50%, #2d3924 100%)"
                    }}
                  >
                    {/* Tarja magnética */}
                    <div className="absolute top-8 left-0 right-0 h-10 bg-[#1d1d1f]" />
                    
                    <div className="relative z-10 h-full flex flex-col justify-between pt-14">
                      <div className="bg-white/90 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-[#86868b] uppercase">Plano</div>
                            <div className="text-sm font-semibold text-[#1d1d1f]">{associado.plano}</div>
                          </div>
                          <div className="w-16 h-16 bg-[#1d1d1f] rounded-lg flex items-center justify-center">
                            <QrCode className="w-12 h-12 text-white" />
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        <p className="text-white/70 text-[10px] leading-relaxed">
                          Esta carteira é pessoal e intransferível. O uso indevido 
                          está sujeito às penalidades previstas em lei.
                        </p>
                        <p className="text-white/50 text-[9px]">
                          www.abracanm.org.br • contato@abracanm.org.br
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div className="text-white/40 text-[8px] tracking-wider">
                          TOQUE PARA VIRAR
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
              <p className="text-center text-[#86868b] text-xs mt-3">
                Clique no cartão para ver o verso
              </p>
            </div>

            {showDetails && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafaf8] hover:bg-[#6B7C59]/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6B7C59]/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#6B7C59]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1d1d1f]">Próxima Consulta</div>
                      <div className="text-xs text-[#86868b]">Nenhuma agendada</div>
                    </div>
                  </div>
                  <motion.button
                    className="px-4 py-1.5 rounded-full bg-[#6B7C59] text-white text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Agendar
                  </motion.button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fafaf8] hover:bg-[#6B7C59]/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#6B7C59]/10 rounded-lg">
                      <Shield className="w-5 h-5 text-[#6B7C59]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[#1d1d1f]">Status da Assinatura</div>
                      <div className="text-xs text-[#86868b]">Ativa até {associado.validade}</div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    statusColors[associado.status]
                  )}>
                    {statusLabels[associado.status]}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function CarteirinhaSimples({ associado }: { associado: AssociadoData }) {
  return (
    <motion.div
      className="w-full max-w-sm rounded-2xl p-6 overflow-hidden relative"
      style={{ 
        background: "linear-gradient(135deg, #6B7C59 0%, #4A5A3A 50%, #3d4a30 100%)"
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      {/* Padrão decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white/30" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full border-2 border-white/20" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CannabisLeaf className="text-white" size={28} />
            <div className="text-white font-bold text-base tracking-wide">ABRACANM</div>
          </div>
          <div className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/20 text-white">
            ASSOCIADO
          </div>
        </div>

        <div>
          <div className="text-white font-semibold text-lg">{associado.nome}</div>
          <div className="text-white/70 text-sm">{associado.plano}</div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-white/60 text-[10px] uppercase">Matrícula</div>
            <div className="text-white font-mono tracking-wider">{associado.matricula}</div>
          </div>
          <div>
            <div className="text-white/60 text-[10px] uppercase">Validade</div>
            <div className="text-white font-mono">{associado.validade}</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
