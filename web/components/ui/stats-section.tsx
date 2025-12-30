'use client'

import { Users, Clock, Shield, CheckCircle } from "lucide-react"
import { motion } from 'framer-motion'

const stats = [
  {
    icon: Users,
    value: "+5.000",
    label: "Pacientes Atendidos",
    color: "text-[#3FA174]",
    bgColor: "bg-[#3FA174]/10",
    iconColor: "text-[#3FA174]"
  },
  {
    icon: Clock,
    value: "48h",
    label: "Atendimento Rápido",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    iconColor: "text-amber-500"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Legal e Seguro",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500"
  }
]

export function StatsSection() {
  return (
    <div className="relative py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#3FA174]/5 via-transparent to-amber-500/5 rounded-3xl blur-xl" />
          
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm uppercase tracking-wide">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex justify-center mt-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3FA174] text-white rounded-full shadow-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Consulta Realizada</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
