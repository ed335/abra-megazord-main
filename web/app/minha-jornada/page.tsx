'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  FileText, 
  CreditCard, 
  CheckCircle, 
  ChevronRight,
  Shield,
  Clock,
  AlertCircle,
  Lock,
  Unlock,
  Calendar,
  Stethoscope,
  Package,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';
import Header from '@/components/shared/Header';

interface NextStep {
  etapa: number;
  titulo: string;
  descricao: string;
  cta: string;
  rota: string;
  tempoEstimado?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  icone: string;
}

interface PacienteData {
  id: string;
  nome: string;
  perfilOnboarding: string | null;
  statusOnboarding: string;
  etapaOnboarding: number;
  onboardingCompleto: boolean;
  numeroAssociado: string | null;
}

const BENEFICIOS = [
  {
    id: 'consultas',
    titulo: 'Consultas com Desconto',
    descricao: 'Atendimento com medicos especializados',
    icone: Stethoscope,
    requer: 'ASSOCIADO_ATIVO',
  },
  {
    id: 'carteirinha',
    titulo: 'Carteirinha Digital',
    descricao: 'Identificacao oficial de associado',
    icone: CreditCard,
    requer: 'ASSOCIADO_ATIVO',
  },
  {
    id: 'orientacao',
    titulo: 'Orientacao Juridica',
    descricao: 'Suporte para questoes legais',
    icone: Shield,
    requer: 'ASSOCIADO_ATIVO',
  },
  {
    id: 'produtos',
    titulo: 'Acesso a Fornecedores',
    descricao: 'Produtos de qualidade verificada',
    icone: Package,
    requer: 'PRESCRICAO',
  },
];

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  LEAD: { label: 'Iniciando', cor: 'gray' },
  DOCS_PENDENTES: { label: 'Documentos Pendentes', cor: 'yellow' },
  EM_VALIDACAO: { label: 'Em Analise', cor: 'blue' },
  ASSOCIADO_ATIVO: { label: 'Ativo', cor: 'green' },
  ASSOCIADO_INATIVO: { label: 'Inativo', cor: 'red' },
  BLOQUEADO: { label: 'Bloqueado', cor: 'red' },
};

export default function MinhaJornadaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState<PacienteData | null>(null);
  const [proximoPasso, setProximoPasso] = useState<NextStep | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

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
      setProximoPasso(data.proximoPasso);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const podeAcessarBeneficio = (requer: string) => {
    if (!paciente) return false;
    
    if (requer === 'ASSOCIADO_ATIVO') {
      return paciente.statusOnboarding === 'ASSOCIADO_ATIVO';
    }
    
    if (requer === 'PRESCRICAO') {
      return paciente.statusOnboarding === 'ASSOCIADO_ATIVO' && 
             (paciente.perfilOnboarding === 'PRESCRICAO' || paciente.perfilOnboarding === 'ANVISA');
    }
    
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-abracanm-green"></div>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[paciente?.statusOnboarding || 'LEAD'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Minha Jornada</h1>
          <p className="text-gray-600 mt-1">Acompanhe seu progresso e proximos passos</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-abracanm-green/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-abracanm-green" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ola,</p>
                <p className="font-semibold text-gray-900">{paciente?.nome}</p>
              </div>
            </div>
            <div className={`
              inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
              ${statusInfo.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
              ${statusInfo.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
              ${statusInfo.cor === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
              ${statusInfo.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
              ${statusInfo.cor === 'gray' ? 'bg-gray-100 text-gray-700' : ''}
            `}>
              <div className={`w-2 h-2 rounded-full
                ${statusInfo.cor === 'green' ? 'bg-green-500' : ''}
                ${statusInfo.cor === 'yellow' ? 'bg-yellow-500' : ''}
                ${statusInfo.cor === 'blue' ? 'bg-blue-500' : ''}
                ${statusInfo.cor === 'red' ? 'bg-red-500' : ''}
                ${statusInfo.cor === 'gray' ? 'bg-gray-500' : ''}
              `} />
              {statusInfo.label}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Perfil</p>
                <p className="font-semibold text-gray-900">
                  {paciente?.perfilOnboarding === 'INICIANTE' && 'Iniciante'}
                  {paciente?.perfilOnboarding === 'PRESCRICAO' && 'Com Prescricao'}
                  {paciente?.perfilOnboarding === 'ANVISA' && 'Com ANVISA'}
                  {!paciente?.perfilOnboarding && 'Nao definido'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">N Associado</p>
                <p className="font-semibold text-gray-900">
                  {paciente?.numeroAssociado || 'Pendente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {proximoPasso && proximoPasso.etapa < 99 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              rounded-xl p-6 mb-8
              ${proximoPasso.prioridade === 'alta' ? 'bg-abracanm-green text-white' : ''}
              ${proximoPasso.prioridade === 'media' ? 'bg-yellow-50 border border-yellow-200' : ''}
              ${proximoPasso.prioridade === 'baixa' ? 'bg-gray-50 border border-gray-200' : ''}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowRight className={`w-5 h-5 ${proximoPasso.prioridade === 'alta' ? 'text-white' : 'text-abracanm-green'}`} />
                  <span className={`text-sm font-medium ${proximoPasso.prioridade === 'alta' ? 'text-white/80' : 'text-gray-500'}`}>
                    Proximo passo
                  </span>
                </div>
                <h2 className={`text-xl font-bold mb-2 ${proximoPasso.prioridade === 'alta' ? 'text-white' : 'text-gray-900'}`}>
                  {proximoPasso.titulo}
                </h2>
                <p className={`mb-4 ${proximoPasso.prioridade === 'alta' ? 'text-white/90' : 'text-gray-600'}`}>
                  {proximoPasso.descricao}
                </p>
                {proximoPasso.tempoEstimado && (
                  <p className={`text-sm flex items-center gap-1 mb-4 ${proximoPasso.prioridade === 'alta' ? 'text-white/70' : 'text-gray-500'}`}>
                    <Clock className="w-4 h-4" />
                    {proximoPasso.tempoEstimado}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => router.push(proximoPasso.rota)}
              className={`
                w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors
                ${proximoPasso.prioridade === 'alta' 
                  ? 'bg-white text-abracanm-green hover:bg-gray-100' 
                  : 'bg-abracanm-green text-white hover:bg-abracanm-green-dark'}
              `}
            >
              {proximoPasso.cta}
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {proximoPasso?.etapa === 99 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">Tudo Certo!</h2>
                <p className="text-green-700">
                  Sua associacao esta ativa. Aproveite todos os beneficios!
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Beneficios</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {BENEFICIOS.map(beneficio => {
              const liberado = podeAcessarBeneficio(beneficio.requer);
              
              return (
                <div
                  key={beneficio.id}
                  className={`
                    bg-white rounded-xl border p-4 transition-all
                    ${liberado 
                      ? 'border-green-200 hover:shadow-md cursor-pointer' 
                      : 'border-gray-200 opacity-60'}
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      ${liberado ? 'bg-green-100' : 'bg-gray-100'}
                    `}>
                      {liberado ? (
                        <beneficio.icone className="w-6 h-6 text-green-600" />
                      ) : (
                        <Lock className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{beneficio.titulo}</h3>
                        {liberado && <Unlock className="w-4 h-4 text-green-500" />}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{beneficio.descricao}</p>
                      {!liberado && (
                        <p className="text-xs text-gray-400 mt-2">
                          {beneficio.requer === 'ASSOCIADO_ATIVO' && 'Disponivel apos ativar associacao'}
                          {beneficio.requer === 'PRESCRICAO' && 'Requer prescricao medica aprovada'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {paciente?.statusOnboarding === 'ASSOCIADO_ATIVO' && (
          <div className="text-center">
            <button
              onClick={() => router.push('/carteirinha')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-abracanm-green text-white rounded-lg font-medium hover:bg-abracanm-green-dark transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Ver Minha Carteirinha
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
