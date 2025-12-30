"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin,
  Send,
  MapPin,
  Clock,
  Phone,
  Mail,
  ArrowRight
} from "lucide-react"
import CannabisLeaf from "@/components/icons/CannabisLeaf"

function FooterSection() {
  return (
    <footer className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-[#1B4332] via-[#2D5A45] to-[#1B4332] py-16 md:py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-[#3FA174]/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <CannabisLeaf className="text-[#3FA174]" size={16} />
            <span className="text-white/90 text-sm font-medium">Cannabis Medicinal Legal</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Pronto para começar seu tratamento?
          </h2>
          <p className="text-white/70 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Agende sua consulta agora e dê o primeiro passo para uma vida com mais qualidade e bem-estar
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro">
              <Button className="bg-[#3FA174] hover:bg-[#359966] text-white px-8 py-6 text-base font-semibold rounded-full shadow-lg shadow-[#3FA174]/30 transition-all hover:shadow-xl hover:shadow-[#3FA174]/40 hover:scale-105">
                Agendar consulta
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="https://wa.me/5561981471038" target="_blank">
              <Button variant="outline" className="border-2 border-white/40 bg-white/10 backdrop-blur-sm text-white hover:bg-white hover:text-[#1B4332] px-8 py-6 text-base font-semibold rounded-full transition-all">
                Falar no WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3FA174] to-[#2D8B5F] rounded-xl flex items-center justify-center shadow-lg shadow-[#3FA174]/20">
                  <CannabisLeaf className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold text-gray-900">ABRACANM</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Associação Brasileira de Cannabis Medicinal. Conectando pacientes a tratamentos seguros, legais e humanizados.
              </p>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Seu melhor e-mail"
                  className="pr-12 bg-white border-gray-200 rounded-full h-12 shadow-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-[#3FA174] text-white hover:bg-[#359966] transition-all hover:scale-105"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Receba novidades e conteúdos exclusivos
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-5">Links Rápidos</h3>
              <nav className="space-y-3">
                {["Início", "Sobre Nós", "Planos", "Educação", "Contato"].map((item) => (
                  <Link 
                    key={item}
                    href={`/${item.toLowerCase().replace(" ", "-").replace("início", "")}`} 
                    className="block text-gray-600 text-sm hover:text-[#3FA174] transition-colors hover:translate-x-1 transform duration-200"
                  >
                    {item}
                  </Link>
                ))}
              </nav>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-5">Contato</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#3FA174]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#3FA174]" />
                  </div>
                  <p className="text-gray-600 text-sm">Brasília, DF - Brasil</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#3FA174]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#3FA174]" />
                  </div>
                  <p className="text-gray-600 text-sm">Segunda a Sexta: 9h às 18h</p>
                </div>
                <Link href="https://wa.me/5561981471038" target="_blank" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-[#3FA174]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4 text-[#3FA174]" />
                  </div>
                  <p className="text-gray-600 text-sm">(61) 98147-1038</p>
                </Link>
                <Link href="mailto:contato@abracanm.org.br" className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-[#3FA174]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-[#3FA174]" />
                  </div>
                  <p className="text-gray-600 text-sm">contato@abracanm.org.br</p>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-5">Siga-nos</h3>
              <div className="flex gap-3 mb-6">
                {[
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Youtube, label: "YouTube", href: "#" },
                  { icon: Linkedin, label: "LinkedIn", href: "#" },
                ].map((social) => (
                  <Link 
                    key={social.label} 
                    href={social.href}
                    className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#3FA174] hover:text-white hover:border-[#3FA174] transition-all hover:scale-110 shadow-sm"
                  >
                    <social.icon className="w-4 h-4" />
                  </Link>
                ))}
              </div>
              <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 mb-2">Selo de Segurança</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#3FA174]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#3FA174]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700">100% Legal e Seguro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-gray-100 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © 2025 ABRACANM - Associação Brasileira de Cannabis Medicinal. Todos os direitos reservados.
            </p>
            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/politica-privacidade" className="text-gray-500 hover:text-[#3FA174] transition-colors">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="text-gray-500 hover:text-[#3FA174] transition-colors">
                Termos de Uso
              </Link>
              <Link href="/politica-cookies" className="text-gray-500 hover:text-[#3FA174] transition-colors">
                Cookies
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { FooterSection }
