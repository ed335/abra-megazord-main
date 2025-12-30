'use client';

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  User,
  Users,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type PerfilIntake = 'PACIENTE_NOVO' | 'EM_TRATAMENTO' | 'CUIDADOR';

type IntakeForm = {
  perfil: PerfilIntake;
  condicaoPrincipal: string;
  objetivoPrincipal: string;
  gravidade: number;
  tratamentosPrevios: string[];
  comorbidades: string[];
  notas: string;
  preferenciaAcompanhamento: string;
  melhorHorario: string;
  contatoEmail: string;
  contatoWhatsapp: string;
  cidade: string;
  estado: string;
  consentiu: boolean;
  origem?: string;
};

const initialState: IntakeForm = {
  perfil: 'PACIENTE_NOVO',
  condicaoPrincipal: '',
  objetivoPrincipal: '',
  gravidade: 3,
  tratamentosPrevios: [],
  comorbidades: [],
  notas: '',
  preferenciaAcompanhamento: '',
  melhorHorario: '',
  contatoEmail: '',
  contatoWhatsapp: '',
  cidade: '',
  estado: '',
  consentiu: false,
  origem: 'web-pre-anamnese',
};

const quizSteps = [
  {
    key: 'perfil',
    title: 'Quem está respondendo?',
    description: 'Conte para nós o seu contexto. Vamos personalizar o cuidado.',
  },
  {
    key: 'objetivo',
    title: 'Qual é o principal objetivo do seu cuidado?',
    description: 'Selecione o motivo central para buscarmos o prescritor certo.',
  },
  {
    key: 'gravidade',
    title: 'Como você descreveria a intensidade dos sintomas?',
    description: 'Use uma escala simples para entendermos a urgência.',
  },
  {
    key: 'tratamentos',
    title: 'O que você já tentou até agora?',
    description: 'Isso ajuda a evitar repetições e direcionar melhor o tratamento.',
  },
  {
    key: 'comorbidades',
    title: 'Há algo importante para considerarmos?',
    description: 'Comorbidades e informações de segurança são essenciais.',
  },
  {
    key: 'preferencias',
    title: 'Como prefere ser acompanhado?',
    description: 'Formato, horários e observações rápidas.',
  },
  {
    key: 'contato',
    title: 'Como podemos falar com você?',
    description: 'Contato e localização para direcionar o suporte.',
  },
];

const pillBase =
  'flex items-center gap-3 w-full text-left border rounded-xl px-4 py-3 transition-all duration-200';

export default function QuizWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<IntakeForm>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalSteps = quizSteps.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const updateForm = <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: 'tratamentosPrevios' | 'comorbidades', value: string) => {
    setForm((prev) => {
      const exists = prev[key].includes(value);
      const nextValues = exists ? prev[key].filter((v) => v !== value) : [...prev[key], value];
      return { ...prev, [key]: nextValues };
    });
  };

  const canContinue = useMemo(() => {
    if (step === 0) return form.consentiu;
    if (step === 1) return Boolean(form.condicaoPrincipal);
    if (step === 5) return Boolean(form.preferenciaAcompanhamento || form.melhorHorario);
    if (step === totalSteps - 1) {
      return Boolean(form.contatoEmail && form.cidade && form.estado && form.consentiu);
    }
    return true;
  }, [
    form.consentiu,
    form.condicaoPrincipal,
    form.preferenciaAcompanhamento,
    form.melhorHorario,
    form.contatoEmail,
    form.cidade,
    form.estado,
    step,
    totalSteps,
  ]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiBase}/quiz/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error('Falha ao enviar suas respostas. Tente novamente.');
      }

      setFeedback({
        type: 'success',
        message: 'Recebemos suas respostas. Vamos direcionar você para o melhor caminho.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: 'Não conseguimos enviar agora. Verifique sua conexão e tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const renderPerfil = () => {
    const options = [
      {
        value: 'PACIENTE_NOVO',
        title: 'Sou paciente e estou começando',
        description: 'Quero entender se a cannabis medicinal pode ajudar.',
        icon: Users,
      },
      {
        value: 'EM_TRATAMENTO',
        title: 'Já estou em tratamento',
        description: 'Preciso organizar documentos e acompanhamento.',
        icon: Stethoscope,
      },
      {
        value: 'CUIDADOR',
        title: 'Sou cuidador/familiar',
        description: 'Quero apoiar alguém com orientação segura.',
        icon: User,
      },
    ] as const;

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          const active = form.perfil === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateForm('perfil', option.value)}
              className={`${pillBase} ${active ? 'border-verde-oliva bg-verde-claro/10 shadow-sm' : 'border-cinza-claro bg-white hover:border-verde-oliva/60'}`}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-verde-claro/20 text-verde-oliva">
                <Icon className="w-5 h-5" />
              </span>
              <span className="flex-1">
                <p className="font-semibold text-cinza-escuro">{option.title}</p>
                <p className="text-sm text-cinza-medio">{option.description}</p>
              </span>
              {active && <CheckCircle2 className="w-5 h-5 text-verde-oliva" />}
            </button>
          );
        })}
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-off-white border border-cinza-claro">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-cinza-medio text-verde-oliva focus:ring-verde-oliva"
            checked={form.consentiu}
            onChange={(e) => updateForm('consentiu', e.target.checked)}
          />
          <span className="text-sm text-cinza-escuro">
            Concordo em compartilhar dados para triagem inicial conforme LGPD.
          </span>
        </label>
      </div>
    );
  };

  const renderObjetivo = () => {
    const options = [
      { value: 'Dor crônica', icon: Heart },
      { value: 'Ansiedade / sono', icon: Moon },
      { value: 'Epilepsia / TEA', icon: Brain },
      { value: 'Outros', icon: Sparkles },
    ];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option) => {
            const Icon = option.icon;
            const active = form.condicaoPrincipal === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateForm('condicaoPrincipal', option.value)}
                className={`${pillBase} ${active ? 'border-verde-oliva bg-verde-claro/10' : 'border-cinza-claro bg-white hover:border-verde-oliva/60'}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-verde-claro/20 text-verde-oliva">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="flex-1">
                  <p className="font-semibold text-cinza-escuro">{option.value}</p>
                </span>
                {active && <CheckCircle2 className="w-5 h-5 text-verde-oliva" />}
              </button>
            );
          })}
        </div>
        <div>
          <label className="block text-sm font-medium text-cinza-escuro mb-1">
            Descreva rapidamente o que deseja alcançar
          </label>
          <textarea
            value={form.objetivoPrincipal}
            onChange={(e) => updateForm('objetivoPrincipal', e.target.value)}
            className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
            rows={3}
            placeholder="Ex.: Reduzir crises, melhorar sono, organizar documentação..."
          />
        </div>
      </div>
    );
  };

  const renderGravidade = () => {
    const scale = [1, 2, 3, 4, 5];
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-3">
          {scale.map((value) => {
            const active = form.gravidade === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => updateForm('gravidade', value)}
                className={`flex flex-col items-center justify-center rounded-xl border px-3 py-4 transition-all ${active ? 'border-verde-oliva bg-verde-claro/10 text-verde-oliva shadow-sm' : 'border-cinza-claro bg-white hover:border-verde-oliva/60 text-cinza-escuro'}`}
              >
                <span className="text-lg font-semibold">{value}</span>
                <span className="text-xs text-cinza-medio">Nível</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-cinza-medio">
          1 = sintomas leves | 3 = moderados | 5 = intensos/limitantes. Isso não substitui avaliação médica.
        </p>
      </div>
    );
  };

  const renderTratamentos = () => {
    const options = ['Nenhum', 'Ansiolíticos', 'Anticonvulsivantes', 'Fisioterapia', 'Psicoterapia', 'Outros'];
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option) => {
            const active = form.tratamentosPrevios.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleArrayValue('tratamentosPrevios', option)}
                className={`${pillBase} ${active ? 'border-verde-oliva bg-verde-claro/10' : 'border-cinza-claro bg-white hover:border-verde-oliva/60'}`}
              >
                <Stethoscope className="w-5 h-5 text-verde-oliva" />
                <span className="flex-1">{option}</span>
                {active && <CheckCircle2 className="w-5 h-5 text-verde-oliva" />}
              </button>
            );
          })}
        </div>
        <textarea
          value={form.notas}
          onChange={(e) => updateForm('notas', e.target.value)}
          className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
          rows={3}
          placeholder="Se quiser, detalhe como seu corpo respondeu aos tratamentos anteriores."
        />
      </div>
    );
  };

  const renderComorbidades = () => {
    const options = ['Hipertensão', 'Diabetes', 'Histórico psiquiátrico', 'Gestação/planejamento', 'Outros'];
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option) => {
            const active = form.comorbidades.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleArrayValue('comorbidades', option)}
                className={`${pillBase} ${active ? 'border-verde-oliva bg-verde-claro/10' : 'border-cinza-claro bg-white hover:border-verde-oliva/60'}`}
              >
                <ShieldCheck className="w-5 h-5 text-verde-oliva" />
                <span className="flex-1">{option}</span>
                {active && <CheckCircle2 className="w-5 h-5 text-verde-oliva" />}
              </button>
            );
          })}
        </div>
        <textarea
          value={form.notas}
          onChange={(e) => updateForm('notas', e.target.value)}
          className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
          rows={3}
          placeholder="Observações de segurança, alergias ou restrições importantes."
        />
      </div>
    );
  };

  const renderPreferencias = () => {
    const options = [
      { value: 'Online', icon: Sparkles },
      { value: 'Presencial', icon: MapPin },
      { value: 'Híbrido', icon: Heart },
    ];
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {options.map((option) => {
            const Icon = option.icon;
            const active = form.preferenciaAcompanhamento === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateForm('preferenciaAcompanhamento', option.value)}
                className={`${pillBase} ${active ? 'border-verde-oliva bg-verde-claro/10' : 'border-cinza-claro bg-white hover:border-verde-oliva/60'}`}
              >
                <Icon className="w-5 h-5 text-verde-oliva" />
                <span className="flex-1">{option.value}</span>
                {active && <CheckCircle2 className="w-5 h-5 text-verde-oliva" />}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-cinza-escuro mb-1">
              Melhor horário para contato
            </label>
            <input
              type="text"
              value={form.melhorHorario}
              onChange={(e) => updateForm('melhorHorario', e.target.value)}
              className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
              placeholder="Manhã / Tarde / Noite"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-cinza-escuro mb-1">
              Observações rápidas
            </label>
            <input
              type="text"
              value={form.notas}
              onChange={(e) => updateForm('notas', e.target.value)}
              className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
              placeholder="Preferências, tempo de resposta, etc."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderContato = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-cinza-escuro mb-1">
            E-mail (obrigatório)
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-cinza-claro bg-white px-4 py-3">
            <Mail className="w-5 h-5 text-verde-oliva" />
            <input
              type="email"
              required
              value={form.contatoEmail}
              onChange={(e) => updateForm('contatoEmail', e.target.value)}
              className="w-full bg-transparent text-sm text-cinza-escuro focus:outline-none"
              placeholder="seuemail@exemplo.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-cinza-escuro mb-1">
            WhatsApp (opcional)
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-cinza-claro bg-white px-4 py-3">
            <Phone className="w-5 h-5 text-verde-oliva" />
            <input
              type="tel"
              value={form.contatoWhatsapp}
              onChange={(e) => updateForm('contatoWhatsapp', e.target.value)}
              className="w-full bg-transparent text-sm text-cinza-escuro focus:outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-cinza-escuro mb-1">
            Cidade
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-cinza-claro bg-white px-4 py-3">
            <MapPin className="w-5 h-5 text-verde-oliva" />
            <input
              type="text"
              value={form.cidade}
              onChange={(e) => updateForm('cidade', e.target.value)}
              className="w-full bg-transparent text-sm text-cinza-escuro focus:outline-none"
              placeholder="Cidade"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-cinza-escuro mb-1">
            Estado
          </label>
          <input
            type="text"
            value={form.estado}
            onChange={(e) => updateForm('estado', e.target.value)}
            className="w-full rounded-xl border border-cinza-claro bg-white px-4 py-3 text-sm text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva"
            placeholder="UF"
          />
        </div>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-cinza-claro bg-off-white px-4 py-3">
        <ShieldCheck className="w-5 h-5 text-verde-oliva mt-0.5" />
        <p className="text-sm text-cinza-escuro">
          Seus dados de saúde são sensíveis e tratados com base na LGPD, apenas para direcionar o atendimento e
          conectar você a prescritores habilitados.
        </p>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderPerfil();
      case 1:
        return renderObjetivo();
      case 2:
        return renderGravidade();
      case 3:
        return renderTratamentos();
      case 4:
        return renderComorbidades();
      case 5:
        return renderPreferencias();
      case 6:
        return renderContato();
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-md border border-cinza-claro/60 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-verde-oliva font-semibold">Pré-anamnese guiada</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-cinza-escuro">
            Vamos entender seu contexto para um cuidado seguro
          </h1>
          <p className="text-sm text-cinza-medio mt-1">
            Processo rápido, acolhedor e alinhado à LGPD para direcionar você ao prescritor adequado.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-verde-oliva">
          <Clock3 className="w-4 h-4" />
          <span>{step + 1} / {totalSteps}</span>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-cinza-claro/60 overflow-hidden">
        <div
          className="h-full bg-verde-oliva transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-cinza-escuro">{quizSteps[step].title}</h2>
        <p className="text-sm text-cinza-medio">{quizSteps[step].description}</p>
      </div>

      <div className="space-y-4">{renderStep()}</div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${
            feedback.type === 'success'
              ? 'border-verde-oliva/50 bg-verde-claro/10 text-verde-oliva'
              : 'border-erro/40 bg-red-50 text-erro'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{feedback.message}</p>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3">
        <Button
          variant="secondary"
          size="default"
          className="w-full sm:w-auto"
          onClick={goBack}
          disabled={step === 0 || isSubmitting}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="hidden sm:flex flex-1" />

        <Button
          variant="default"
          size="default"
          className="w-full sm:w-auto"
          onClick={goNext}
          disabled={!canContinue || isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : step === totalSteps - 1 ? 'Enviar e continuar' : 'Próximo'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
