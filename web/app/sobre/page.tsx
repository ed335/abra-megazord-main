"use client"

import { motion } from "framer-motion"
import { Heart, Users, Shield, Award, Target } from "lucide-react"
import CannabisLeaf from "@/components/icons/CannabisLeaf"
import { FooterSection } from "@/components/ui/footer-section"

const valores = [
  {
    icon: Heart,
    title: "Humanização",
    description: "Tratamos cada paciente com empatia, respeito e cuidado individualizado."
  },
  {
    icon: Shield,
    title: "Segurança",
    description: "Garantimos tratamentos 100% legais e regulamentados pela ANVISA."
  },
  {
    icon: Users,
    title: "Acessibilidade",
    description: "Trabalhamos para tornar o tratamento acessível a todos os brasileiros."
  },
  {
    icon: Award,
    title: "Excelência",
    description: "Nossa equipe médica é especializada e comprometida com resultados."
  }
]

const numeros = [
  { valor: "+5.000", label: "Pacientes Atendidos" },
  { valor: "98%", label: "Taxa de Satisfação" },
  { valor: "48h", label: "Tempo Médio de Atendimento" },
  { valor: "24/7", label: "Suporte ao Paciente" }
]

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <section className="pt-24 pb-16 px-4 bg-gradient-to-b from-[#1B4332] to-[#2D5A45]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <CannabisLeaf className="text-[#3FA174]" size={16} />
              <span className="text-white/90 text-sm font-medium">Nossa História</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Sobre a ABRACANM
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Somos a Associação Brasileira de Cannabis Medicinal, dedicada a conectar pacientes a tratamentos seguros, legais e humanizados.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nossa Missão
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Acolhemos pacientes em busca de qualidade de vida através da cannabis medicinal, quebrando barreiras e tabus com ciência, segurança e humanidade.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Trabalhamos para democratizar o acesso ao tratamento com cannabis medicinal no Brasil, conectando pacientes a médicos prescritores especializados através de teleconsultas.
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#3FA174]/10 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#3FA174]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Nosso Objetivo</p>
                  <p className="text-gray-600 text-sm">Saúde, qualidade de vida e longevidade para todos</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {numeros.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-3xl md:text-4xl font-bold text-[#3FA174] mb-2">{item.valor}</p>
                  <p className="text-gray-600 text-sm">{item.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Os princípios que guiam nossa atuação e compromisso com os pacientes
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => (
              <motion.div
                key={valor.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-[#3FA174]/10 rounded-xl flex items-center justify-center mb-4">
                  <valor.icon className="w-6 h-6 text-[#3FA174]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{valor.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{valor.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  )
}
