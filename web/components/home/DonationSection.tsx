'use client';

import Link from 'next/link';
import { Heart, ArrowRight, Users, Sparkles } from 'lucide-react';

export default function DonationSection() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-verde-claro/5">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-verde-claro/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 bg-verde-claro/20 rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-verde-oliva" />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-cinza-escuro mb-2">
                Apoie nossa missão
              </h3>
              <p className="text-cinza-medio text-sm leading-relaxed">
                Sua contribuição ajuda a manter o acolhimento de pacientes, suporte jurídico e 
                educação sobre medicina canábica. Juntos, quebramos barreiras e tabus.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-cinza-medio">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-verde-oliva" />
                  +500 pacientes acolhidos
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-verde-oliva" />
                  100% transparente
                </span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/doacoes"
                className="inline-flex items-center gap-2 bg-verde-oliva text-white px-5 py-3 rounded-lg font-medium hover:bg-verde-claro transition-colors text-sm"
              >
                Fazer uma doação
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
