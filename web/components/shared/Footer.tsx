'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cinza-escuro text-off-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="https://abracann.org.br/_next/image?url=%2Flogo-header.png&w=256&q=75"
                alt="ABRACANM"
                width={120}
                height={32}
                className="object-contain h-8 w-auto"
              />
            </div>
            <p className="text-off-white/80 text-sm leading-relaxed">
              ABRACANM - Associação Brasileira de Cannabis Medicinal
            </p>
            <p className="text-off-white/70 text-sm leading-relaxed">
              Promovendo o acesso seguro à cannabis medicinal com ciência, acolhimento e responsabilidade.
            </p>
            <p className="text-off-white/70 text-sm leading-relaxed">
              CNPJ: 59.859.467/0001-34
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Links</h4>
            <nav className="grid grid-cols-2 gap-2 text-sm text-off-white/80">
              <Link href="/" className="hover:text-off-white">Home</Link>
              <Link href="/#sobre" className="hover:text-off-white">Sobre</Link>
              <Link href="/#como-funciona" className="hover:text-off-white">Como Funciona</Link>
              <Link href="/cadastro" className="hover:text-off-white">Associe-se</Link>
              <Link href="/contato" className="hover:text-off-white">Contato</Link>
              <Link href="/doacoes" className="hover:text-off-white font-medium text-green-400">💚 Doe</Link>
              <Link href="/politica-privacidade" className="hover:text-off-white">Política de Privacidade</Link>
              <Link href="/termos-uso" className="hover:text-off-white">Termos de Uso</Link>
              <Link href="/politica-cookies" className="hover:text-off-white">Política de Cookies</Link>
            </nav>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold mb-2">Contato</h4>
            <div className="space-y-2 text-sm text-off-white/80">
              <a href="tel:+556196084949" className="flex items-center gap-2 hover:text-off-white">
                <Phone className="w-4 h-4" />
                (61) 9608-4949
              </a>
              <a href="mailto:ouvidoria@abracanm.org.br" className="flex items-center gap-2 hover:text-off-white">
                <Mail className="w-4 h-4" />
                ouvidoria@abracanm.org.br
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Quadra QS 1 Rua 212, Edif Connect Towers, Brasília – DF</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-off-white/80 pt-2">
              <a
                href="https://www.instagram.com/abracann_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-off-white"
              >
                <Instagram className="w-4 h-4" />
                @abracanm
              </a>
            </div>
            <a
              href="https://wa.me/5561996084949?text=Olá! Gostaria de falar com o Presidente da ABRACANM."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-verde-oliva hover:bg-verde-escuro text-white rounded-lg transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              Fale com o Presida
            </a>
          </div>
        </div>

        <div className="border-t border-off-white/10 pt-6 text-sm text-off-white/70 flex flex-col sm:flex-row justify-between gap-4">
          <p>© 2025 ABRACANM - Associação Brasileira de Cannabis Medicinal. Todos os direitos reservados.</p>
          <p>Saúde, qualidade de vida e longevidade através da medicina canábica.</p>
        </div>
      </div>
    </footer>
  );
}
