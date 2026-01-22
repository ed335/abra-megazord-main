'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ChevronRight,
  ChevronLeft,
  Upload,
  Stethoscope,
  Shield,
  Leaf,
  Clock,
  AlertCircle,
  X,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import { OBJETIVOS_ONBOARDING, SINTOMAS_ONBOARDING } from '@/lib/onboarding';

interface PacienteData {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cpf: string | null;
  dataNascimento: string | null;
  perfilOnboarding: string | null;
  statusOnboarding: string;
  etapaOnboarding: number;
  onboardingCompleto: boolean;
  objetivoPrincipalOnb: string | null;
  sintomasOnb: string[];
  consenteLGPD: boolean;
  termoAjuizamento: boolean;
}

const PERFIS = [
  {
    id: 'INICIANTE',
    titulo: 'Quero comecar',
    descricao: 'Ainda nao tenho prescricao medica e quero entender como funciona',
    icone: Leaf,
    cor: 'green',
  },
  {
    id: 'PRESCRICAO',
    titulo: 'Ja tenho prescricao',
    descricao: 'Ja possuo receita medica para cannabis medicinal',
    icone: FileText,
    cor: 'blue',
  },
  {
    id: 'ANVISA',
    titulo: 'Tenho prescricao + ANVISA',
    descricao: 'Ja tenho prescricao e autorizacao da ANVISA para importacao',
    icone: Shield,
    cor: 'purple',
  },
];

function AssociarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const etapaParam = searchParams.get('etapa');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(0);
  const [paciente, setPaciente] = useState<PacienteData | null>(null);
  
  const [formData, setFormData] = useState({
    perfilOnboarding: '',
    nome: '',
    cpf: '',
    dataNascimento: '',
    whatsapp: '',
    consenteLGPD: false,
    termoAjuizamento: false,
    objetivoPrincipal: '',
    sintomas: [] as string[],
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (etapaParam) {
      setEtapaAtual(parseInt(etapaParam));
    }
  }, [etapaParam]);

  const carregarDados = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/onboarding', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao carregar dados');
      }

      const data = await response.json();
      setPaciente(data.paciente);
      
      setFormData({
        perfilOnboarding: data.paciente.perfilOnboarding || '',
        nome: data.paciente.nome || '',
        cpf: data.paciente.cpf || '',
        dataNascimento: data.paciente.dataNascimento ? data.paciente.dataNascimento.split('T')[0] : '',
        whatsapp: data.paciente.whatsapp || '',
        consenteLGPD: data.paciente.consenteLGPD || false,
        termoAjuizamento: data.paciente.termoAjuizamento || false,
        objetivoPrincipal: data.paciente.objetivoPrincipalOnb || '',
        sintomas: data.paciente.sintomasOnb || [],
      });

      if (data.paciente.etapaOnboarding > 0 && !etapaParam) {
        setEtapaAtual(data.paciente.etapaOnboarding);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const salvarEtapa = async (etapa: number, dados: any) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ etapa, dados }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar');
      }

      const result = await response.json();
      setPaciente(prev => prev ? { ...prev, ...result.paciente } : null);
      return true;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dados');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const avancarEtapa = async () => {
    let dados: any = {};
    
    switch (etapaAtual) {
      case 0:
        if (!formData.perfilOnboarding) {
          toast.error('Selecione um perfil para continuar');
          return;
        }
        dados = { perfilOnboarding: formData.perfilOnboarding };
        break;
        
      case 1:
        if (!formData.nome || !formData.cpf || !formData.dataNascimento) {
          toast.error('Preencha todos os campos obrigatorios');
          return;
        }
        if (!formData.consenteLGPD || !formData.termoAjuizamento) {
          toast.error('Aceite os termos para continuar');
          return;
        }
        dados = {
          nome: formData.nome,
          cpf: formData.cpf,
          dataNascimento: formData.dataNascimento,
          whatsapp: formData.whatsapp,
          consenteLGPD: formData.consenteLGPD,
          termoAjuizamento: formData.termoAjuizamento,
        };
        break;
        
      case 2:
        if (!formData.objetivoPrincipal) {
          toast.error('Selecione seu objetivo principal');
          return;
        }
        dados = {
          objetivoPrincipal: formData.objetivoPrincipal,
          sintomas: formData.sintomas,
        };
        break;
        
      case 3:
        setEtapaAtual(4);
        return;
        
      case 4:
        router.push('/dashboard');
        return;
    }

    const sucesso = await salvarEtapa(etapaAtual, dados);
    if (sucesso) {
      setEtapaAtual(prev => prev + 1);
    }
  };

  const voltarEtapa = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(prev => prev - 1);
    }
  };

  const formatarCPF = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14);
  };

  const formatarTelefone = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    return numeros
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-abracanm-green"></div>
      </div>
    );
  }

  const etapas = [
    { numero: 0, titulo: 'Perfil', icone: User },
    { numero: 1, titulo: 'Dados', icone: FileText },
    { numero: 2, titulo: 'Triagem', icone: Stethoscope },
    { numero: 3, titulo: 'Documentos', icone: Upload },
    { numero: 4, titulo: 'Ativacao', icone: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Image
            src="/logo-abracanm.svg"
            alt="ABRACANM"
            width={120}
            height={40}
          />
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {etapas.map((etapa, index) => (
            <div key={etapa.numero} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${etapaAtual >= etapa.numero 
                  ? 'bg-abracanm-green text-white' 
                  : 'bg-gray-200 text-gray-500'}
                transition-colors
              `}>
                {etapaAtual > etapa.numero ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <etapa.icone className="w-5 h-5" />
                )}
              </div>
              {index < etapas.length - 1 && (
                <div className={`
                  w-12 sm:w-20 h-1 mx-1
                  ${etapaAtual > etapa.numero ? 'bg-abracanm-green' : 'bg-gray-200'}
                  transition-colors
                `} />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-500">
            Etapa {etapaAtual + 1} de {etapas.length}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {etapas[etapaAtual]?.titulo}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={etapaAtual}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
          >
            {etapaAtual === 0 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Selecione a opcao que melhor descreve sua situacao atual
                </p>
                <div className="grid gap-4">
                  {PERFIS.map(perfil => (
                    <button
                      key={perfil.id}
                      onClick={() => setFormData(prev => ({ ...prev, perfilOnboarding: perfil.id }))}
                      className={`
                        p-4 rounded-xl border-2 text-left transition-all
                        ${formData.perfilOnboarding === perfil.id
                          ? 'border-abracanm-green bg-abracanm-green/5'
                          : 'border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center
                          ${formData.perfilOnboarding === perfil.id
                            ? 'bg-abracanm-green text-white'
                            : 'bg-gray-100 text-gray-500'}
                        `}>
                          <perfil.icone className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{perfil.titulo}</h3>
                          <p className="text-sm text-gray-500 mt-1">{perfil.descricao}</p>
                        </div>
                        {formData.perfilOnboarding === perfil.id && (
                          <CheckCircle className="w-6 h-6 text-abracanm-green" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> ~30 segundos
                </p>
              </div>
            )}

            {etapaAtual === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600 text-center mb-6">
                  Precisamos de algumas informacoes basicas
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={e => setFormData(prev => ({ ...prev, cpf: formatarCPF(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de nascimento *
                  </label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={e => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={e => setFormData(prev => ({ ...prev, whatsapp: formatarTelefone(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consenteLGPD}
                      onChange={e => setFormData(prev => ({ ...prev, consenteLGPD: e.target.checked }))}
                      className="mt-1 w-5 h-5 text-abracanm-green rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      Li e concordo com a <a href="/politica-privacidade" target="_blank" className="text-abracanm-green underline">Politica de Privacidade</a> e autorizo o tratamento dos meus dados pessoais conforme a LGPD. *
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termoAjuizamento}
                      onChange={e => setFormData(prev => ({ ...prev, termoAjuizamento: e.target.checked }))}
                      className="mt-1 w-5 h-5 text-abracanm-green rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">
                      Li e concordo com o <a href="/termos" target="_blank" className="text-abracanm-green underline">Termo de Adesao e Estatuto</a> da ABRACANM. *
                    </span>
                  </label>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> ~2 minutos
                </p>
              </div>
            )}

            {etapaAtual === 2 && (
              <div className="space-y-6">
                <p className="text-gray-600 text-center mb-6">
                  Uma breve triagem para entender suas necessidades
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Qual seu objetivo principal? *
                  </label>
                  <div className="grid gap-2">
                    {OBJETIVOS_ONBOARDING.map(obj => (
                      <button
                        key={obj.id}
                        onClick={() => setFormData(prev => ({ ...prev, objetivoPrincipal: obj.id }))}
                        className={`
                          p-3 rounded-lg border text-left transition-all text-sm
                          ${formData.objetivoPrincipal === obj.id
                            ? 'border-abracanm-green bg-abracanm-green/5 text-abracanm-green'
                            : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        {obj.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quais sintomas voce apresenta? (opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SINTOMAS_ONBOARDING.map(sintoma => (
                      <button
                        key={sintoma.id}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            sintomas: prev.sintomas.includes(sintoma.id)
                              ? prev.sintomas.filter(s => s !== sintoma.id)
                              : [...prev.sintomas, sintoma.id]
                          }));
                        }}
                        className={`
                          p-2 rounded-lg border text-sm transition-all
                          ${formData.sintomas.includes(sintoma.id)
                            ? 'border-abracanm-green bg-abracanm-green/5 text-abracanm-green'
                            : 'border-gray-200 hover:border-gray-300'}
                        `}
                      >
                        {sintoma.label}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.perfilOnboarding === 'INICIANTE' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-blue-800">
                          Como voce ainda nao tem prescricao, podera agendar uma consulta com nossos medicos especializados apos completar o cadastro.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> ~1 minuto
                </p>
              </div>
            )}

            {etapaAtual === 3 && (
              <div className="space-y-6">
                <p className="text-gray-600 text-center mb-6">
                  Envie os documentos necessarios para validar seu cadastro
                </p>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        Apos o envio, nossa equipe ira analisar seus documentos em ate 24 horas uteis.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-center text-gray-500 py-8">
                  A funcionalidade de upload de documentos esta sendo implementada.
                  <br />
                  Por enquanto, continue para a proxima etapa.
                </p>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> ~1 minuto
                </p>
              </div>
            )}

            {etapaAtual === 4 && (
              <div className="space-y-6">
                <p className="text-gray-600 text-center mb-6">
                  Escolha seu plano de contribuicao para ativar sua associacao
                </p>

                <p className="text-center text-gray-500 py-8">
                  Os planos de contribuicao serao exibidos aqui.
                  <br />
                  Integracao com pagamentos em desenvolvimento.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-800">Quase la!</p>
                      <p className="text-sm text-green-700 mt-1">
                        Apos o pagamento, sua associacao sera ativada automaticamente e voce recebera sua carteirinha digital.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" /> ~2 minutos
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6">
          <button
            onClick={voltarEtapa}
            disabled={etapaAtual === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
              ${etapaAtual === 0
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>

          <button
            onClick={avancarEtapa}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-abracanm-green text-white rounded-lg font-medium hover:bg-abracanm-green-dark transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : etapaAtual === 4 ? (
              <>
                Finalizar
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Continuar
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Voce pode salvar e continuar depois a qualquer momento.
        </p>
      </div>
    </div>
  );
}

export default function AssociarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-abracanm-green"></div>
      </div>
    }>
      <AssociarContent />
    </Suspense>
  );
}
