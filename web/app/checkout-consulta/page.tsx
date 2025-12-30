'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Stethoscope,
  Tag,
  ArrowLeft,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FooterSection } from '@/components/ui/footer-section';
import { fetchWithAuth } from '@/lib/auth';
import Link from 'next/link';
import CannabisLeaf from '@/components/icons/CannabisLeaf';

interface UserData {
  id: string;
  nome: string;
  cpf: string;
  planoAtivo: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
}

interface AgendamentoData {
  id: string;
  dataHora: string;
  medico: {
    nome: string;
    especialidade: string;
  };
  valorConsulta: number;
  valorComDesconto: number;
  desconto: number;
}

interface PlanoData {
  id: string;
  nome: string;
  valorMensalidade: number;
  valorConsulta: number;
  valorPrimeiraConsulta: number;
  beneficios: string[];
}

function CheckoutConsultaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agendamentoId = searchParams.get('agendamento');

  const [user, setUser] = useState<UserData | null>(null);
  const [agendamento, setAgendamento] = useState<AgendamentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [planos, setPlanos] = useState<PlanoData[]>([]);
  const [showPlansOffer, setShowPlansOffer] = useState(false);
  const [skipPlansOffer, setSkipPlansOffer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const userData = await fetchWithAuth<UserData>('/api/auth/me');
      setUser(userData);

      if (agendamentoId) {
        const agendamentoData = await fetchWithAuth<{ agendamento: AgendamentoData }>(
          `/api/agendamento/${agendamentoId}`
        );
        setAgendamento(agendamentoData.agendamento);
      }

      const planosRes = await fetch('/api/planos');
      if (planosRes.ok) {
        const planosData = await planosRes.json();
        setPlanos(planosData.planos?.filter((p: PlanoData) => p.valorMensalidade > 0) || []);
      }

      if (!userData.planoAtivo) {
        setShowPlansOffer(true);
      }
    } catch (err) {
      setError('Erro ao carregar dados. Faça login novamente.');
    } finally {
      setLoading(false);
    }
  }, [agendamentoId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGeneratePix = async () => {
    if (!agendamento) {
      setError('Agendamento não encontrado. Volte e selecione uma consulta.');
      return;
    }
    
    if (!user?.cpf) {
      setError('CPF não cadastrado. Por favor, atualize seu perfil antes de continuar.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const cpfDigits = user.cpf.replace(/\D/g, '');
      
      const response = await fetchWithAuth<{
        success: boolean;
        pagamento?: {
          id: string;
          valor: number;
          pixCode: string;
          identifier: string;
          expiracao: string;
        };
        error?: string;
      }>('/api/pagamentos/checkout', {
        method: 'POST',
        body: JSON.stringify({
          tipo: 'CONSULTA',
          cpf: cpfDigits,
          agendamentoId: agendamento.id,
          planoId: user.planoAtivo?.id,
        }),
      });

      if (response.success && response.pagamento) {
        setPixCode(response.pagamento.pixCode);
        startPaymentPolling(response.pagamento.id);
      } else {
        setError(response.error || 'Erro ao gerar pagamento');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar');
    } finally {
      setProcessing(false);
    }
  };

  const startPaymentPolling = (pagamentoId: string) => {
    setCheckingPayment(true);
    
    const interval = setInterval(async () => {
      try {
        const status = await fetchWithAuth<{ status: string }>(
          `/api/pagamentos/${pagamentoId}/status`
        );
        
        if (status.status === 'APROVADO') {
          clearInterval(interval);
          setCheckingPayment(false);
          setPaymentSuccess(true);
        }
      } catch {
        // Continue polling
      }
    }, 5000);

    // Stop after 30 minutes
    setTimeout(() => {
      clearInterval(interval);
      setCheckingPayment(false);
    }, 30 * 60 * 1000);
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
      </main>
    );
  }

  if (paymentSuccess) {
    return (
      <main className="min-h-screen bg-gray-50">
        <section className="py-20 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Pagamento Confirmado!
              </h1>
              <p className="text-gray-600 mb-6">
                Sua consulta foi paga com sucesso. Você receberá o link do Google Meet no dia da consulta via WhatsApp.
              </p>
              
              {agendamento && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-[#3FA174]" />
                    <span className="text-gray-900 font-medium">
                      {new Date(agendamento.dataHora).toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#3FA174]" />
                    <span className="text-gray-900 font-medium">
                      {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full bg-[#3FA174] hover:bg-[#359966]"
              >
                Ir para Dashboard
              </Button>
            </motion.div>
          </div>
        </section>
        <FooterSection />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-12 px-4">
        <div className="max-w-lg mx-auto">
          <Link href="/agendar-consulta" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#3FA174] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao agendamento
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#3FA174] to-[#2D8B5F] p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CannabisLeaf size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Pagamento da Consulta</h1>
                  <p className="text-white/80 text-sm">Finalize seu agendamento</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {user?.planoAtivo && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-700">
                      Desconto de Associado {user.planoAtivo.nome}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600">
                    Você tem desconto especial nas consultas!
                  </p>
                </div>
              )}

              {agendamento && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-[#3FA174]" />
                    <div>
                      <p className="text-sm text-gray-500">Médico</p>
                      <p className="font-medium text-gray-900">{agendamento.medico.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#3FA174]" />
                    <div>
                      <p className="text-sm text-gray-500">Data</p>
                      <p className="font-medium text-gray-900">
                        {new Date(agendamento.dataHora).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: '2-digit',
                          month: 'long',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#3FA174]" />
                    <div>
                      <p className="text-sm text-gray-500">Horário</p>
                      <p className="font-medium text-gray-900">
                        {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Valor da consulta</span>
                  <span className="text-gray-400 line-through">
                    R$ {agendamento?.valorConsulta?.toFixed(2) || '149,00'}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600 text-sm">Desconto associado</span>
                  <span className="text-green-600 text-sm">
                    -{agendamento?.desconto || 30}%
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-[#3FA174]">
                    R$ {agendamento?.valorComDesconto?.toFixed(2) || '104,30'}
                  </span>
                </div>
              </div>

              {showPlansOffer && !skipPlansOffer && !user?.planoAtivo && !pixCode && planos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-[#3FA174] rounded-2xl p-5 bg-gradient-to-br from-[#3FA174]/5 to-white"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#3FA174]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-5 h-5 text-[#3FA174]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Economize na sua consulta!</h3>
                      <p className="text-sm text-gray-600">
                        Torne-se associado e pague menos nesta e nas próximas consultas
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {planos.slice(0, 2).map((plano) => {
                      const economiaConsulta = (agendamento?.valorConsulta || 149) - plano.valorPrimeiraConsulta;
                      return (
                        <div
                          key={plano.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#3FA174] transition-colors cursor-pointer"
                          onClick={() => router.push(`/checkout?plano=${plano.id}&tipo=MENSALIDADE&redirect=/checkout-consulta?agendamento=${agendamentoId}`)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-semibold text-gray-900">Plano {plano.nome}</span>
                              <span className="ml-2 text-xs bg-[#3FA174]/10 text-[#3FA174] px-2 py-0.5 rounded-full">
                                R$ {plano.valorMensalidade.toFixed(0)}/mês
                              </span>
                            </div>
                            {economiaConsulta > 0 && (
                              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                Economize R$ {economiaConsulta.toFixed(0)}
                              </span>
                            )}
                          </div>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-[#3FA174]" />
                              Primeira consulta por R$ {plano.valorPrimeiraConsulta.toFixed(0)}
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-[#3FA174]" />
                              Retornos por R$ {plano.valorConsulta.toFixed(0)}
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-[#3FA174]" />
                              Suporte via WhatsApp
                            </li>
                          </ul>
                          <Button className="w-full mt-3 bg-[#3FA174] hover:bg-[#359966]">
                            Assinar e Economizar
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setSkipPlansOffer(true)}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
                  >
                    Continuar sem plano e pagar R$ {(agendamento?.valorConsulta || 149).toFixed(0)} →
                  </button>
                </motion.div>
              )}

              {(!showPlansOffer || skipPlansOffer || user?.planoAtivo) && !pixCode && (
                <Button
                  onClick={handleGeneratePix}
                  disabled={processing}
                  className="w-full bg-[#3FA174] hover:bg-[#359966] py-6 text-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar com PIX
                    </>
                  )}
                </Button>
              )}

              {pixCode && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                    <div className="relative">
                      <div className="bg-white border border-gray-200 rounded-lg p-3 pr-12 font-mono text-xs break-all max-h-24 overflow-y-auto">
                        {pixCode}
                      </div>
                      <button
                        onClick={copyPixCode}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#3FA174] text-white rounded-lg hover:bg-[#359966] transition-colors"
                      >
                        {pixCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {checkingPayment && (
                    <div className="flex items-center justify-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Aguardando confirmação do pagamento...</span>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    O código PIX expira em 30 minutos. Após o pagamento, a confirmação é automática.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pagamento seguro via PIX processado por Syncpay
          </p>
        </div>
      </section>
      <FooterSection />
    </main>
  );
}

export default function CheckoutConsultaPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
        </main>
      }
    >
      <CheckoutConsultaPageContent />
    </Suspense>
  );
}
