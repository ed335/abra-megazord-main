'use client';

import { ShieldCheck, Stethoscope, Users, Check } from 'lucide-react';

const personas = [
  {
    icon: ShieldCheck,
    title: 'Pacientes',
    bullets: [
      'Onboarding acolhedor, consentimento LGPD e validação rápida.',
      'Prescrições digitais, laudos e QR code organizados em um cartão seguro.',
      'Acompanhamento contínuo, educação responsável e suporte em caso de dúvida.',
    ],
  },
  {
    icon: Stethoscope,
    title: 'Prescritores',
    bullets: [
      'Validação de CRM, assinatura digital e fluxos seguros para prescrever.',
      'Histórico do paciente organizado, com consentimento e auditoria.',
      'Comunicação clara com pacientes e alertas de validade.',
    ],
  },
  {
    icon: Users,
    title: 'Clínicas & Admin',
    bullets: [
      'Governança, RBAC, logs e trilhas de auditoria para compliance.',
      'Políticas internas alinhadas à LGPD e consentimento documentado.',
      'Relatórios e visão consolidada para gestão da associação.',
    ],
  },
];

export default function PersonasSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-cinza-muito-claro">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-verde-oliva uppercase tracking-wide">
            Para quem é
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-cinza-escuro mt-2">
            AbraCann para cada perfil
          </h2>
          <p className="text-lg text-cinza-medio mt-3">
            Fluxos pensados para pacientes, prescritores e equipes administrativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((persona) => {
            const Icon = persona.icon;
            return (
              <div
                key={persona.title}
                className="h-full bg-white border border-cinza-claro rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-verde-claro/15 text-verde-oliva flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-cinza-escuro">
                    {persona.title}
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-cinza-medio leading-relaxed">
                  {persona.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 rounded-lg transition-all"
                    >
                      <span className="mt-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-verde-claro/30 text-verde-oliva">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-cinza-claro rounded-xl p-4 shadow-sm">
          <p className="text-sm sm:text-base text-cinza-escuro">
            Precisa entender qual fluxo seguir? Fale com a equipe AbraCann e receba orientação segura.
          </p>
          <a
            href="/contato"
            className="text-sm font-semibold text-verde-oliva hover:underline"
          >
            Falar com a equipe →
          </a>
        </div>
      </div>
    </section>
  );
}
