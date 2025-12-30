'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Stethoscope,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/components/layout/AppLayout';
import { fetchWithAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  crm: string;
  fotoUrl: string | null;
  duracaoConsulta: number;
  disponibilidades: {
    diaSemana: number;
    horaInicio: string;
    horaFim: string;
  }[];
}

interface Horario {
  horario: string;
  disponivel: boolean;
}

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AgendarConsultaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [medicoSelecionado, setMedicoSelecionado] = useState<Medico | null>(null);
  const [dataSelecionada, setDataSelecionada] = useState<Date | null>(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState<string | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agendamentoData, setAgendamentoData] = useState<{
    id: string;
    dataHora: string;
    medico: string;
  } | null>(null);

  const fetchMedicos = useCallback(async () => {
    try {
      const response = await fetch('/api/agendamento/medicos');
      const data = await response.json();
      setMedicos(data.medicos || []);
    } catch (err) {
      setError('Erro ao carregar médicos disponíveis');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHorarios = useCallback(async () => {
    if (!medicoSelecionado || !dataSelecionada) return;
    
    setLoadingHorarios(true);
    setHorarioSelecionado(null);
    
    try {
      const dataStr = dataSelecionada.toISOString().split('T')[0];
      const response = await fetch(
        `/api/agendamento/horarios?medicoId=${medicoSelecionado.id}&data=${dataStr}`
      );
      const data = await response.json();
      setHorarios(data.horarios || []);
    } catch (err) {
      setError('Erro ao carregar horários disponíveis');
    } finally {
      setLoadingHorarios(false);
    }
  }, [dataSelecionada, medicoSelecionado]);

  useEffect(() => {
    fetchMedicos();
  }, [fetchMedicos]);

  useEffect(() => {
    if (medicoSelecionado && dataSelecionada) {
      fetchHorarios();
    }
  }, [medicoSelecionado, dataSelecionada, fetchHorarios]);

  const handleAgendar = async () => {
    if (!medicoSelecionado || !dataSelecionada || !horarioSelecionado) return;

    setSubmitting(true);
    setError('');

    try {
      const dataStr = dataSelecionada.toISOString().split('T')[0];
      const response = await fetchWithAuth<{
        success: boolean;
        agendamento?: { id: string; dataHora: string; medico: string };
        error?: string;
      }>('/api/agendamento/criar', {
        method: 'POST',
        body: JSON.stringify({
          medicoId: medicoSelecionado.id,
          data: dataStr,
          horario: horarioSelecionado,
          tipo: 'PRIMEIRA_CONSULTA',
        }),
      });

      if (response.success && response.agendamento) {
        setAgendamentoData(response.agendamento);
        router.push(`/checkout-consulta?agendamento=${response.agendamento.id}`);
      } else {
        setError(response.error || 'Erro ao agendar consulta');
      }
    } catch (err: unknown) {
      if (err instanceof Error && (err as Error & { code?: string }).code === 'UNAUTHORIZED') {
        router.push('/login?redirect=/agendar-consulta');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao agendar consulta');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isDateAvailable = (date: Date) => {
    if (!medicoSelecionado) return false;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (date < hoje) return false;
    
    const diaSemana = date.getDay();
    return medicoSelecionado.disponibilidades.some(d => d.diaSemana === diaSemana);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (success && agendamentoData) {
    return (
      <AppLayout title="Agendar Consulta">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
          >
            <div className="w-16 h-16 bg-[#3FA174]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-[#3FA174]" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Consulta Agendada!
            </h1>
            <p className="text-gray-500 mb-6">
              Você receberá uma confirmação via WhatsApp.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3 mb-3">
                <Calendar className="w-5 h-5 text-[#3FA174]" />
                <span className="text-gray-900 font-medium">
                  {new Date(agendamentoData.dataHora).toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-[#3FA174]" />
                <span className="text-gray-900 font-medium">
                  {new Date(agendamentoData.dataHora).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-[#3FA174]" />
                <span className="text-gray-900 font-medium">{agendamentoData.medico}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/dashboard')}
              >
                Ir para Início
              </Button>
              <Button 
                className="flex-1 bg-gray-900 hover:bg-gray-800"
                onClick={() => {
                  setSuccess(false);
                  setStep(1);
                  setMedicoSelecionado(null);
                  setDataSelecionada(null);
                  setHorarioSelecionado(null);
                }}
              >
                Agendar Outra
              </Button>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Agendar Consulta">
      <div className="space-y-6">
        {/* Steps indicator */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-gray-200">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  step === s
                    ? 'bg-gray-900 text-white'
                    : step > s
                    ? 'bg-[#3FA174]/10 text-[#3FA174]'
                    : 'text-gray-400'
                }`}
              >
                {step > s ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold">
                    {s}
                  </span>
                )}
                <span className="text-sm font-medium hidden sm:block">
                  {s === 1 ? 'Médico' : s === 2 ? 'Data' : 'Horário'}
                </span>
              </div>
            ))}
          </div>
        </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#3FA174]" />
                  Escolha o Médico
                </h2>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
                  </div>
                ) : medicos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum médico disponível no momento.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {medicos.map((medico) => (
                      <motion.button
                        key={medico.id}
                        onClick={() => {
                          setMedicoSelecionado(medico);
                          setStep(2);
                        }}
                        className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                          medicoSelecionado?.id === medico.id
                            ? 'border-[#3FA174] bg-[#3FA174]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#3FA174]/10 flex items-center justify-center flex-shrink-0">
                            <Stethoscope className="w-6 h-6 text-[#3FA174]" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{medico.nome}</h3>
                            <p className="text-sm text-gray-600">{medico.especialidade}</p>
                            <p className="text-xs text-gray-400 mt-1">{medico.crm}</p>
                            <p className="text-xs text-[#3FA174] mt-1">
                              Consulta de {medico.duracaoConsulta} min
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && medicoSelecionado && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-gray-200 p-4 max-w-md mx-auto"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#3FA174]" />
                    Escolha a Data
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="gap-1 h-8 text-xs"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    Voltar
                  </Button>
                </div>

                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Médico:</span> {medicoSelecionado.nome}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {meses[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {diasSemana.map((dia) => (
                      <div key={dia} className="text-center text-[10px] font-medium text-gray-400 py-1">
                        {dia}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-0.5">
                    {getDaysInMonth(currentMonth).map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="w-9 h-9" />;
                      }

                      const isAvailable = isDateAvailable(date);
                      const isSelected = dataSelecionada?.toDateString() === date.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => {
                            if (isAvailable) {
                              setDataSelecionada(date);
                              setStep(3);
                            }
                          }}
                          disabled={!isAvailable}
                          className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-[#3FA174] text-white'
                              : isAvailable
                              ? 'hover:bg-[#3FA174]/10 text-gray-900'
                              : 'text-gray-300 cursor-not-allowed'
                          } ${isToday && !isSelected ? 'ring-1 ring-[#3FA174]' : ''}`}
                        >
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Selecione uma data disponível
                </p>
              </motion.div>
            )}

            {step === 3 && medicoSelecionado && dataSelecionada && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#3FA174]" />
                    Escolha o Horário
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-xl space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Médico:</span> {medicoSelecionado.nome}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Data:</span>{' '}
                    {dataSelecionada.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                    })}
                  </p>
                </div>

                {loadingHorarios ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
                  </div>
                ) : horarios.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Nenhum horário disponível para esta data.</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setStep(2)}
                    >
                      Escolher outra data
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
                      {horarios.map(({ horario, disponivel }) => (
                        <button
                          key={horario}
                          onClick={() => disponivel && setHorarioSelecionado(horario)}
                          disabled={!disponivel}
                          className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                            horarioSelecionado === horario
                              ? 'bg-[#3FA174] text-white'
                              : disponivel
                              ? 'bg-gray-100 hover:bg-[#3FA174]/10 text-gray-900'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
                          }`}
                        >
                          {horario}
                        </button>
                      ))}
                    </div>

                    <Button
                      onClick={handleAgendar}
                      disabled={!horarioSelecionado || submitting}
                      className="w-full bg-[#3FA174] hover:bg-[#359966] py-6 text-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Agendando...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Confirmar Agendamento
                        </>
                      )}
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

      </div>
    </AppLayout>
  );
}
