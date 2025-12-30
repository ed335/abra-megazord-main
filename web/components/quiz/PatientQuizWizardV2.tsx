'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Pill,
  Activity,
  AlertTriangle,
  Stethoscope,
  User,
  Clock,
  Loader2,
  Sparkles,
  Target,
  Zap,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/auth';
import { toast } from 'sonner';
import CannabisLeaf from '@/components/icons/CannabisLeaf';

interface QuizAnswers {
  perfil: string;
  idade: string;
  peso: string;
  altura: string;
  objetivoPrincipal: string;
  objetivoSecundario: string[];
  tempoSintomas: string;
  intensidadeSintomas: number;
  frequenciaSintomas: string;
  usouCannabis: string;
  experienciaCannabis: string;
  medicamentosAtuais: string[];
  medicamentoOutro: string;
  alergiaMedicamentos: string;
  condicoesSaude: string[];
  condicaoOutra: string;
  historicoFamiliar: string[];
  tabagismo: string;
  alcool: string;
  atividadeFisica: string;
  qualidadeSono: string;
  nivelEstresse: number;
  expectativasTratamento: string[];
  expectativasOutro: string;
  preocupacoes: string;
  disponibilidadeHorario: string;
  preferenciaContato: string;
  consentimento: boolean;
}

const initialAnswers: QuizAnswers = {
  perfil: '',
  idade: '',
  peso: '',
  altura: '',
  objetivoPrincipal: '',
  objetivoSecundario: [],
  tempoSintomas: '',
  intensidadeSintomas: 5,
  frequenciaSintomas: '',
  usouCannabis: '',
  experienciaCannabis: '',
  medicamentosAtuais: [],
  medicamentoOutro: '',
  alergiaMedicamentos: '',
  condicoesSaude: [],
  condicaoOutra: '',
  historicoFamiliar: [],
  tabagismo: '',
  alcool: '',
  atividadeFisica: '',
  qualidadeSono: '',
  nivelEstresse: 5,
  expectativasTratamento: [],
  expectativasOutro: '',
  preocupacoes: '',
  disponibilidadeHorario: '',
  preferenciaContato: '',
  consentimento: false,
};

const steps = [
  { id: 'intro', title: 'Boas-vindas', icon: Sparkles },
  { id: 'perfil', title: 'Seu Perfil', icon: User },
  { id: 'objetivo', title: 'Objetivo', icon: Target },
  { id: 'sintomas', title: 'Sintomas', icon: Activity },
  { id: 'cannabis', title: 'Cannabis', icon: CannabisLeaf },
  { id: 'medicamentos', title: 'Medicamentos', icon: Pill },
  { id: 'saude', title: 'Saúde', icon: Heart },
  { id: 'estilo', title: 'Estilo de Vida', icon: Zap },
  { id: 'expectativas', title: 'Expectativas', icon: ThumbsUp },
  { id: 'contato', title: 'Contato', icon: Clock },
];

const objetivos = [
  { value: 'dor_cronica', label: 'Dor crônica', icon: '💪' },
  { value: 'ansiedade', label: 'Ansiedade', icon: '😰' },
  { value: 'depressao', label: 'Depressão', icon: '😔' },
  { value: 'insonia', label: 'Insônia', icon: '😴' },
  { value: 'epilepsia', label: 'Epilepsia', icon: '⚡' },
  { value: 'parkinson', label: 'Parkinson', icon: '🧠' },
  { value: 'esclerose', label: 'Esclerose Múltipla', icon: '🔬' },
  { value: 'fibromialgia', label: 'Fibromialgia', icon: '🦴' },
  { value: 'autismo', label: 'Autismo (TEA)', icon: '🧩' },
  { value: 'tdah', label: 'TDAH', icon: '🎯' },
  { value: 'cancer', label: 'Tratamento oncológico', icon: '🎗️' },
  { value: 'outro', label: 'Outro', icon: '📋' },
];

const condicoesSaude = [
  'Hipertensão', 'Diabetes', 'Doenças cardíacas', 'Asma/DPOC',
  'Doenças renais', 'Doenças hepáticas', 'Transtornos psiquiátricos',
  'Doenças autoimunes', 'Nenhuma', 'Outra',
];

const medicamentosComuns = [
  'Antidepressivos', 'Ansiolíticos', 'Anticonvulsivantes', 'Analgésicos',
  'Anti-inflamatórios', 'Opioides', 'Medicamentos para dormir',
  'Nenhum', 'Outro',
];

export default function PatientQuizWizardV2() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [diagnostico, setDiagnostico] = useState<any>(null);

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const updateAnswer = <K extends keyof QuizAnswers>(key: K, value: QuizAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayAnswer = (key: keyof QuizAnswers, value: string) => {
    setAnswers(prev => {
      const current = prev[key] as string[];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter(v => v !== value) : [...current, value],
      };
    });
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'intro':
        return answers.consentimento;
      case 'perfil':
        return answers.perfil && answers.idade;
      case 'objetivo':
        return answers.objetivoPrincipal;
      case 'sintomas':
        return answers.tempoSintomas && answers.frequenciaSintomas;
      case 'cannabis':
        return answers.usouCannabis;
      case 'medicamentos':
        return true;
      case 'saude':
        return true;
      case 'estilo':
        return answers.qualidadeSono;
      case 'expectativas':
        return answers.expectativasTratamento.length > 0;
      case 'contato':
        return answers.disponibilidadeHorario && answers.preferenciaContato;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth<{ success: boolean; diagnostico: any; error?: string }>(
        '/api/pre-anamnese',
        {
          method: 'POST',
          body: JSON.stringify(answers),
        }
      );

      if (response.success) {
        setDiagnostico(response.diagnostico);
        setCompleted(true);
        toast.success('Pré-anamnese concluída!');
      } else {
        toast.error(response.error || 'Erro ao salvar');
      }
    } catch (err) {
      toast.error('Erro ao enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completed && diagnostico) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#3FA174] to-[#2D8B5F] p-6 text-white text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Pré-Anamnese Concluída!</h2>
            <p className="text-white/80 mt-2">Sua ficha foi preparada para o médico</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="bg-[#3FA174]/5 rounded-xl p-4 border border-[#3FA174]/20">
              <h3 className="font-semibold text-gray-900 mb-2">{diagnostico.titulo}</h3>
              <p className="text-gray-600 text-sm">{diagnostico.resumo}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Nível de Urgência</p>
                <p className={`font-semibold ${
                  diagnostico.nivelUrgencia === 'alta' ? 'text-red-600' :
                  diagnostico.nivelUrgencia === 'moderada' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {diagnostico.nivelUrgencia?.charAt(0).toUpperCase() + diagnostico.nivelUrgencia?.slice(1)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Próximo Passo</p>
                <p className="font-semibold text-[#3FA174]">Agendar Consulta</p>
              </div>
            </div>

            {diagnostico.indicacoes?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Indicações preliminares:</p>
                <div className="flex flex-wrap gap-2">
                  {diagnostico.indicacoes.map((ind: string, i: number) => (
                    <span key={i} className="text-xs bg-[#3FA174]/10 text-[#3FA174] px-3 py-1 rounded-full">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push('/agendar-consulta')}
              className="w-full bg-[#3FA174] hover:bg-[#359966] py-6 text-lg"
            >
              Agendar Consulta
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Etapa {currentStep + 1} de {steps.length}
          </span>
          <span className="text-sm font-medium text-[#3FA174]">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#3FA174] to-[#2D8B5F]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-3 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`flex flex-col items-center min-w-[60px] ${
                i <= currentStep ? 'text-[#3FA174]' : 'text-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i < currentStep ? 'bg-[#3FA174] text-white' :
                i === currentStep ? 'bg-[#3FA174]/20 text-[#3FA174]' : 'bg-gray-100'
              }`}>
                {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
              </div>
              <span className="text-[10px] mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="bg-[#3FA174] hover:bg-[#359966] gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : currentStep === steps.length - 1 ? (
            <>
              Concluir
              <CheckCircle2 className="w-4 h-4" />
            </>
          ) : (
            <>
              Continuar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  function renderStep() {
    const step = steps[currentStep];

    switch (step.id) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-[#3FA174]/10 rounded-full flex items-center justify-center">
              <CannabisLeaf size={40} className="text-[#3FA174]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bem-vindo à Pré-Anamnese</h2>
              <p className="text-gray-600 mt-2">
                Esse questionário vai ajudar nossos médicos a entender melhor sua situação e preparar uma consulta personalizada.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Importante</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Suas respostas são confidenciais e protegidas pela LGPD. Apenas o médico que realizará sua consulta terá acesso.
                  </p>
                </div>
              </div>
            </div>
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={answers.consentimento}
                onChange={(e) => updateAnswer('consentimento', e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#3FA174] focus:ring-[#3FA174]"
              />
              <span className="text-sm text-gray-700">
                Li e concordo com os termos de uso e política de privacidade
              </span>
            </label>
          </div>
        );

      case 'perfil':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Sobre você</h2>
              <p className="text-gray-600 text-sm mt-1">Informações básicas para o médico</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Quem está respondendo?</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'paciente', label: 'Eu mesmo', icon: User },
                  { value: 'cuidador', label: 'Cuidador', icon: Heart },
                  { value: 'familiar', label: 'Familiar', icon: Stethoscope },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('perfil', opt.value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                      answers.perfil === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <opt.icon className={`w-6 h-6 ${answers.perfil === opt.value ? 'text-[#3FA174]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${answers.perfil === opt.value ? 'text-[#3FA174]' : 'text-gray-600'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Idade</label>
                <input
                  type="number"
                  value={answers.idade}
                  onChange={(e) => updateAnswer('idade', e.target.value)}
                  placeholder="Anos"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Peso</label>
                <input
                  type="number"
                  value={answers.peso}
                  onChange={(e) => updateAnswer('peso', e.target.value)}
                  placeholder="kg"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Altura</label>
                <input
                  type="number"
                  value={answers.altura}
                  onChange={(e) => updateAnswer('altura', e.target.value)}
                  placeholder="cm"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
            </div>
          </div>
        );

      case 'objetivo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Principal motivo da consulta</h2>
              <p className="text-gray-600 text-sm mt-1">Qual condição você busca tratar?</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {objetivos.map(obj => (
                <button
                  key={obj.value}
                  onClick={() => updateAnswer('objetivoPrincipal', obj.value)}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    answers.objetivoPrincipal === obj.value
                      ? 'border-[#3FA174] bg-[#3FA174]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{obj.icon}</span>
                  <span className={`text-sm font-medium text-center ${
                    answers.objetivoPrincipal === obj.value ? 'text-[#3FA174]' : 'text-gray-600'
                  }`}>
                    {obj.label}
                  </span>
                </button>
              ))}
            </div>

            {answers.objetivoPrincipal === 'outro' && (
              <input
                type="text"
                value={answers.objetivoSecundario[0] || ''}
                onChange={(e) => updateAnswer('objetivoSecundario', [e.target.value])}
                placeholder="Descreva sua condição"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            )}
          </div>
        );

      case 'sintomas':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Sobre seus sintomas</h2>
              <p className="text-gray-600 text-sm mt-1">Ajude-nos a entender a intensidade</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Há quanto tempo você tem esses sintomas?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'menos_1_mes', label: 'Menos de 1 mês' },
                  { value: '1_6_meses', label: '1 a 6 meses' },
                  { value: '6_12_meses', label: '6 meses a 1 ano' },
                  { value: 'mais_1_ano', label: 'Mais de 1 ano' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('tempoSintomas', opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      answers.tempoSintomas === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Intensidade dos sintomas (1-10)
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={answers.intensidadeSintomas}
                  onChange={(e) => updateAnswer('intensidadeSintomas', parseInt(e.target.value))}
                  className="w-full accent-[#3FA174]"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Leve</span>
                  <span className="text-lg font-bold text-[#3FA174]">{answers.intensidadeSintomas}</span>
                  <span>Intenso</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Com que frequência os sintomas aparecem?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'raramente', label: 'Raramente' },
                  { value: 'algumas_vezes', label: 'Algumas vezes/semana' },
                  { value: 'diariamente', label: 'Diariamente' },
                  { value: 'constante', label: 'Constantemente' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('frequenciaSintomas', opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      answers.frequenciaSintomas === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cannabis':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Experiência com Cannabis</h2>
              <p className="text-gray-600 text-sm mt-1">Informações importantes para o tratamento</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Você já usou cannabis medicinal antes?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'nunca', label: 'Nunca' },
                  { value: 'ja_usei', label: 'Já usei' },
                  { value: 'uso_atual', label: 'Uso atualmente' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('usouCannabis', opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      answers.usouCannabis === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(answers.usouCannabis === 'ja_usei' || answers.usouCannabis === 'uso_atual') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Como foi/é sua experiência?
                </label>
                <textarea
                  value={answers.experienciaCannabis}
                  onChange={(e) => updateAnswer('experienciaCannabis', e.target.value)}
                  placeholder="Descreva brevemente sua experiência, efeitos sentidos, produtos utilizados..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] resize-none"
                />
              </div>
            )}
          </div>
        );

      case 'medicamentos':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Medicamentos</h2>
              <p className="text-gray-600 text-sm mt-1">Quais medicamentos você usa atualmente?</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {medicamentosComuns.map(med => (
                <button
                  key={med}
                  onClick={() => toggleArrayAnswer('medicamentosAtuais', med)}
                  className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                    answers.medicamentosAtuais.includes(med)
                      ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>

            {answers.medicamentosAtuais.includes('Outro') && (
              <input
                type="text"
                value={answers.medicamentoOutro}
                onChange={(e) => updateAnswer('medicamentoOutro', e.target.value)}
                placeholder="Liste outros medicamentos"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tem alergia a algum medicamento?
              </label>
              <input
                type="text"
                value={answers.alergiaMedicamentos}
                onChange={(e) => updateAnswer('alergiaMedicamentos', e.target.value)}
                placeholder="Liste alergias conhecidas ou digite 'Nenhuma'"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            </div>
          </div>
        );

      case 'saude':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Histórico de Saúde</h2>
              <p className="text-gray-600 text-sm mt-1">Condições importantes para o tratamento</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Possui alguma dessas condições?
              </label>
              <div className="flex flex-wrap gap-2">
                {condicoesSaude.map(cond => (
                  <button
                    key={cond}
                    onClick={() => toggleArrayAnswer('condicoesSaude', cond)}
                    className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                      answers.condicoesSaude.includes(cond)
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>

            {answers.condicoesSaude.includes('Outra') && (
              <input
                type="text"
                value={answers.condicaoOutra}
                onChange={(e) => updateAnswer('condicaoOutra', e.target.value)}
                placeholder="Descreva outras condições"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Histórico familiar relevante
              </label>
              <div className="flex flex-wrap gap-2">
                {['Doenças cardíacas', 'Diabetes', 'Câncer', 'Transtornos mentais', 'Nenhum'].map(hist => (
                  <button
                    key={hist}
                    onClick={() => toggleArrayAnswer('historicoFamiliar', hist)}
                    className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                      answers.historicoFamiliar.includes(hist)
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {hist}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'estilo':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Estilo de Vida</h2>
              <p className="text-gray-600 text-sm mt-1">Hábitos que podem influenciar o tratamento</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Tabagismo</label>
                <select
                  value={answers.tabagismo}
                  onChange={(e) => updateAnswer('tabagismo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                >
                  <option value="">Selecione</option>
                  <option value="nunca">Nunca fumei</option>
                  <option value="ex_fumante">Ex-fumante</option>
                  <option value="fumante">Fumante</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Álcool</label>
                <select
                  value={answers.alcool}
                  onChange={(e) => updateAnswer('alcool', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                >
                  <option value="">Selecione</option>
                  <option value="nunca">Não bebo</option>
                  <option value="social">Socialmente</option>
                  <option value="regular">Regularmente</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Como está sua qualidade de sono?
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'otima', label: 'Ótima', icon: '😊' },
                  { value: 'boa', label: 'Boa', icon: '🙂' },
                  { value: 'ruim', label: 'Ruim', icon: '😐' },
                  { value: 'pessima', label: 'Péssima', icon: '😴' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('qualidadeSono', opt.value)}
                    className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                      answers.qualidadeSono === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xl mb-1">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Nível de estresse (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={answers.nivelEstresse}
                onChange={(e) => updateAnswer('nivelEstresse', parseInt(e.target.value))}
                className="w-full accent-[#3FA174]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Baixo</span>
                <span className="text-lg font-bold text-[#3FA174]">{answers.nivelEstresse}</span>
                <span>Alto</span>
              </div>
            </div>
          </div>
        );

      case 'expectativas':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Suas Expectativas</h2>
              <p className="text-gray-600 text-sm mt-1">O que você espera do tratamento?</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                'Reduzir dor', 'Melhorar sono', 'Diminuir ansiedade', 'Reduzir medicamentos',
                'Melhorar qualidade de vida', 'Controlar crises', 'Outro',
              ].map(exp => (
                <button
                  key={exp}
                  onClick={() => toggleArrayAnswer('expectativasTratamento', exp)}
                  className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                    answers.expectativasTratamento.includes(exp)
                      ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>

            {answers.expectativasTratamento.includes('Outro') && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Descreva sua expectativa:
                </label>
                <input
                  type="text"
                  value={answers.expectativasOutro}
                  onChange={(e) => updateAnswer('expectativasOutro', e.target.value)}
                  placeholder="Digite aqui sua expectativa específica..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tem alguma preocupação ou dúvida específica?
              </label>
              <textarea
                value={answers.preocupacoes}
                onChange={(e) => updateAnswer('preocupacoes', e.target.value)}
                placeholder="Compartilhe qualquer preocupação que tenha sobre o tratamento..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] resize-none"
              />
            </div>
          </div>
        );

      case 'contato':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Preferências de Contato</h2>
              <p className="text-gray-600 text-sm mt-1">Como podemos melhor atendê-lo?</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Melhor horário para consulta
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'manha', label: 'Manhã', sub: '8h-12h' },
                  { value: 'tarde', label: 'Tarde', sub: '12h-18h' },
                  { value: 'noite', label: 'Noite', sub: '18h-21h' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('disponibilidadeHorario', opt.value)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${
                      answers.disponibilidadeHorario === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`font-medium ${answers.disponibilidadeHorario === opt.value ? 'text-[#3FA174]' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-gray-500">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Preferência de contato
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'email', label: 'Email' },
                  { value: 'telefone', label: 'Telefone' },
                  { value: 'qualquer', label: 'Qualquer' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer('preferenciaContato', opt.value)}
                    className={`p-3 rounded-xl border-2 text-sm transition-all ${
                      answers.preferenciaContato === opt.value
                        ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174] font-medium'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}
