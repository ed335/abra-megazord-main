'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Video,
  Search,
  ChevronRight,
  User,
  Phone,
  Mail,
  FileText,
  Loader2,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth, getToken } from '@/lib/auth';
import { toast } from 'sonner';
import CannabisLeaf from '@/components/icons/CannabisLeaf';

interface Paciente {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  fotoUrl?: string;
  preAnamnese?: {
    objetivoPrincipal: string;
    intensidadeSintomas: number;
    tempoSintomas: string;
    frequenciaSintomas: string;
    usouCannabis: string;
    experienciaCannabis: string;
    condicoesSaude: string[];
    medicamentosAtuais: string[];
    alergiaMedicamentos: string;
    historicoFamiliar: string[];
    qualidadeSono: string;
    nivelEstresse: number;
    tabagismo: string;
    alcool: string;
    expectativasTratamento: string[];
    preocupacoes: string;
    idade: string;
    peso: string;
    altura: string;
    disponibilidadeHorario: string;
    createdAt: string;
    diagnostico?: {
      titulo: string;
      resumo: string;
      nivelUrgencia: string;
      indicacoes: string[];
      contraindicacoes: string[];
    };
  };
  agendamento?: {
    id: string;
    dataHora: string;
    tipo: string;
    status: string;
    pagamentoStatus: string;
  };
  plano?: {
    nome: string;
    tipo: string;
  };
}

interface Stats {
  totalPacientes: number;
  consultasHoje: number;
  consultasSemana: number;
  aguardandoConfirmacao: number;
}

export default function PainelMedicoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'hoje' | 'semana' | 'aguardando'>('todos');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);
  }, [router]);

  const fetchPacientes = useCallback(async () => {
    try {
      const response = await fetchWithAuth<{ success: boolean; pacientes: Paciente[]; stats: Stats }>(
        `/api/medico/pacientes?filter=${filter}`
      );
      if (response.success) {
        setPacientes(response.pacientes);
        setStats(response.stats);
      }
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED' || err?.message?.includes('Sessão')) {
        router.replace('/login');
        return;
      }
      if (err?.message?.includes('médicos')) {
        toast.error('Acesso restrito a médicos');
        router.replace('/dashboard');
        return;
      }
      toast.error('Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    if (authChecked) {
      fetchPacientes();
    }
  }, [filter, authChecked, fetchPacientes]);

  const filteredPacientes = pacientes.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.cpf.includes(search)
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getObjetivoLabel = (objetivo: string) => {
    const labels: Record<string, string> = {
      dor_cronica: 'Dor Crônica',
      ansiedade: 'Ansiedade',
      depressao: 'Depressão',
      insonia: 'Insônia',
      epilepsia: 'Epilepsia',
      parkinson: 'Parkinson',
      esclerose: 'Esclerose Múltipla',
      fibromialgia: 'Fibromialgia',
      autismo: 'Autismo (TEA)',
      tdah: 'TDAH',
      cancer: 'Tratamento Oncológico',
      outro: 'Outro',
    };
    return labels[objetivo] || objetivo;
  };

  const getIntensidadeColor = (intensidade: number) => {
    if (intensidade <= 3) return 'text-green-600 bg-green-100';
    if (intensidade <= 6) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <CannabisLeaf size={32} className="text-[#3FA174]" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Painel Médico</h1>
                <p className="text-xs text-gray-500">CRM de Pacientes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/medico/pacientes')}
                className="gap-2"
              >
                <Users className="w-4 h-4" />
                CRM Pacientes
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Agenda
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#3FA174]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#3FA174]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPacientes}</p>
                  <p className="text-xs text-gray-500">Pacientes no CRM</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.consultasHoje}</p>
                  <p className="text-xs text-gray-500">Consultas hoje</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.consultasSemana}</p>
                  <p className="text-xs text-gray-500">Consultas na semana</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.aguardandoConfirmacao}</p>
                  <p className="text-xs text-gray-500">Aguardando</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou CPF..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'hoje', label: 'Hoje' },
              { key: 'semana', label: 'Semana' },
              { key: 'aguardando', label: 'Aguardando' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key
                    ? 'bg-[#3FA174] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {filteredPacientes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum paciente encontrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Pacientes aparecem após preencherem a anamnese e pagarem a consulta
                </p>
              </div>
            ) : (
              filteredPacientes.map((paciente, i) => (
                <motion.div
                  key={paciente.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPaciente(paciente)}
                  className={`bg-white rounded-xl p-4 border cursor-pointer transition-all ${
                    selectedPaciente?.id === paciente.id
                      ? 'border-[#3FA174] ring-2 ring-[#3FA174]/20'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#3FA174]/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {paciente.fotoUrl ? (
                        <Image
                          src={paciente.fotoUrl}
                          alt={paciente.nome || 'Foto do paciente'}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-[#3FA174]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">{paciente.nome}</h3>
                          <p className="text-sm text-gray-500">{paciente.email}</p>
                        </div>
                        {paciente.agendamento && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            paciente.agendamento.status === 'CONFIRMADO'
                              ? 'bg-green-100 text-green-700'
                              : paciente.agendamento.status === 'PENDENTE'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {paciente.agendamento.status}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {paciente.preAnamnese?.objetivoPrincipal && (
                          <span className="px-2 py-1 bg-[#3FA174]/10 text-[#3FA174] text-xs rounded-full">
                            {getObjetivoLabel(paciente.preAnamnese.objetivoPrincipal)}
                          </span>
                        )}
                        {paciente.preAnamnese && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getIntensidadeColor(paciente.preAnamnese.intensidadeSintomas)}`}>
                            Intensidade: {paciente.preAnamnese.intensidadeSintomas}/10
                          </span>
                        )}
                        {paciente.plano && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {paciente.plano.nome}
                          </span>
                        )}
                      </div>
                      {paciente.agendamento && (
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(paciente.agendamento.dataHora)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Video className="w-4 h-4" />
                            {paciente.agendamento.tipo}
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="lg:col-span-1">
            {selectedPaciente ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-[#3FA174]/10 rounded-full flex items-center justify-center overflow-hidden">
                      {selectedPaciente.fotoUrl ? (
                        <Image
                          src={selectedPaciente.fotoUrl}
                          alt={selectedPaciente.nome || 'Foto do paciente'}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-[#3FA174]" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{selectedPaciente.nome}</h2>
                      <p className="text-sm text-gray-500">{formatDate(selectedPaciente.dataNascimento)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Contato</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{selectedPaciente.telefone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{selectedPaciente.email}</span>
                      </div>
                    </div>
                  </div>

                  {selectedPaciente.preAnamnese && (
                    <>
                      <div className="border-t border-gray-100 pt-4">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Pré-Anamnese</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500">Objetivo Principal</p>
                            <p className="font-medium text-[#3FA174]">
                              {getObjetivoLabel(selectedPaciente.preAnamnese.objetivoPrincipal)}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-gray-500">Intensidade</p>
                              <p className="font-medium">{selectedPaciente.preAnamnese.intensidadeSintomas}/10</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Estresse</p>
                              <p className="font-medium">{selectedPaciente.preAnamnese.nivelEstresse}/10</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tempo de Sintomas</p>
                            <p className="font-medium capitalize">{selectedPaciente.preAnamnese.tempoSintomas.replace(/_/g, ' ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Experiência com Cannabis</p>
                            <p className="font-medium capitalize">{selectedPaciente.preAnamnese.usouCannabis.replace(/_/g, ' ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Qualidade do Sono</p>
                            <p className="font-medium capitalize">{selectedPaciente.preAnamnese.qualidadeSono || 'Não informado'}</p>
                          </div>
                          {selectedPaciente.preAnamnese.frequenciaSintomas && (
                            <div>
                              <p className="text-xs text-gray-500">Frequência dos Sintomas</p>
                              <p className="font-medium capitalize">{selectedPaciente.preAnamnese.frequenciaSintomas.replace(/_/g, ' ')}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {(selectedPaciente.preAnamnese.idade || selectedPaciente.preAnamnese.peso || selectedPaciente.preAnamnese.altura) && (
                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Dados Físicos</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedPaciente.preAnamnese.idade && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-bold text-gray-900">{selectedPaciente.preAnamnese.idade}</p>
                                <p className="text-xs text-gray-500">anos</p>
                              </div>
                            )}
                            {selectedPaciente.preAnamnese.peso && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-bold text-gray-900">{selectedPaciente.preAnamnese.peso}</p>
                                <p className="text-xs text-gray-500">kg</p>
                              </div>
                            )}
                            {selectedPaciente.preAnamnese.altura && (
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-lg font-bold text-gray-900">{selectedPaciente.preAnamnese.altura}</p>
                                <p className="text-xs text-gray-500">cm</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {(selectedPaciente.preAnamnese.tabagismo || selectedPaciente.preAnamnese.alcool) && (
                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Hábitos</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedPaciente.preAnamnese.tabagismo && (
                              <div>
                                <p className="text-xs text-gray-500">Tabagismo</p>
                                <p className="font-medium capitalize">{selectedPaciente.preAnamnese.tabagismo.replace(/_/g, ' ')}</p>
                              </div>
                            )}
                            {selectedPaciente.preAnamnese.alcool && (
                              <div>
                                <p className="text-xs text-gray-500">Álcool</p>
                                <p className="font-medium capitalize">{selectedPaciente.preAnamnese.alcool}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.experienciaCannabis && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Experiência com Cannabis</p>
                          <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                            {selectedPaciente.preAnamnese.experienciaCannabis}
                          </p>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.condicoesSaude.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Condições de Saúde</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPaciente.preAnamnese.condicoesSaude.map((c, i) => (
                              <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.medicamentosAtuais.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Medicamentos Atuais</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPaciente.preAnamnese.medicamentosAtuais.map((m, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                {m}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.alergiaMedicamentos && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Alergias a Medicamentos</p>
                          <p className="text-sm text-red-700 bg-red-50 p-2 rounded-lg">
                            {selectedPaciente.preAnamnese.alergiaMedicamentos}
                          </p>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.historicoFamiliar && selectedPaciente.preAnamnese.historicoFamiliar.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Histórico Familiar</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPaciente.preAnamnese.historicoFamiliar.map((h, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.diagnostico && (
                        <div className="border-t border-gray-100 pt-4">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Diagnóstico Preliminar</h3>
                          <div className="bg-[#3FA174]/5 rounded-lg p-3 border border-[#3FA174]/20">
                            <p className="font-medium text-gray-900">{selectedPaciente.preAnamnese.diagnostico.titulo}</p>
                            <p className="text-sm text-gray-600 mt-1">{selectedPaciente.preAnamnese.diagnostico.resumo}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                selectedPaciente.preAnamnese.diagnostico.nivelUrgencia === 'alta'
                                  ? 'bg-red-100 text-red-700'
                                  : selectedPaciente.preAnamnese.diagnostico.nivelUrgencia === 'moderada'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                Urgência: {selectedPaciente.preAnamnese.diagnostico.nivelUrgencia}
                              </span>
                            </div>
                          </div>
                          {selectedPaciente.preAnamnese.diagnostico.contraindicacoes && selectedPaciente.preAnamnese.diagnostico.contraindicacoes.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-red-600 font-medium mb-1">Contraindicações:</p>
                              <ul className="text-xs text-red-600 list-disc list-inside">
                                {selectedPaciente.preAnamnese.diagnostico.contraindicacoes.map((c, i) => (
                                  <li key={i}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.expectativasTratamento.length > 0 && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Expectativas</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedPaciente.preAnamnese.expectativasTratamento.map((e, i) => (
                              <span key={i} className="px-2 py-1 bg-[#3FA174]/10 text-[#3FA174] text-xs rounded-full">
                                {e}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.preocupacoes && (
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-xs text-gray-500 mb-2">Preocupações</p>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {selectedPaciente.preAnamnese.preocupacoes}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  {selectedPaciente.agendamento && (
                    <Button
                      onClick={() => router.push(`/consulta/${selectedPaciente.agendamento!.id}`)}
                      className="w-full bg-[#3FA174] hover:bg-[#359966] gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Iniciar Consulta
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center sticky top-24">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Selecione um paciente</p>
                <p className="text-sm text-gray-400 mt-1">para ver a ficha completa</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
