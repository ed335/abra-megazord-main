'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, User, Phone, MapPin, Calendar, Heart, Clock,
  FileText, Activity, MessageCircle, X, Video, ClipboardList,
  Stethoscope, Target, ChevronLeft, Pill, Brain, Moon, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchWithAuth } from '@/lib/auth';

interface PreAnamnese {
  id?: string;
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
  expectativasOutro?: string;
  preocupacoes: string;
  idade: string;
  peso: string;
  altura: string;
  disponibilidadeHorario: string;
  createdAt?: string;
  diagnostico?: {
    titulo: string;
    resumo: string;
    nivelUrgencia: string;
    indicacoes: string[];
    contraindicacoes: string[];
  };
}

interface Paciente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  patologiaCID: string | null;
  jaUsaCannabis: boolean;
  criadoEm: string;
  preAnamnese: PreAnamnese | null;
  agendamento?: {
    id: string;
    dataHora: string;
    tipo: string;
    status: string;
  };
  plano?: {
    nome: string;
    tipo: string;
  };
}

function getInitials(nome: string): string {
  const parts = nome.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() || 'US';
}

function getAvatarColor(nome: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500'
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MedicoPacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'com-anamnese' | 'agendados'>('todos');
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchWithAuth<{ success: boolean; pacientes: Paciente[] }>(
        `/api/medico/pacientes?filter=${filter}`
      );
      if (response.success) {
        setPacientes(response.pacientes);
      }
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        router.replace('/login-medico');
        return;
      }
      setError(err?.message || 'Erro ao carregar pacientes');
    } finally {
      setLoading(false);
    }
  }, [filter, router]);

  useEffect(() => {
    fetchPacientes();
  }, [fetchPacientes]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatWhatsApp = (phone: string) => {
    const digits = phone?.replace(/\D/g, '') || '';
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  const getWhatsAppLink = (phone: string, nome: string) => {
    const digits = phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(`Olá ${nome.split(' ')[0]}, aqui é seu médico da ABRACANM. Como posso ajudar?`);
    return `https://wa.me/55${digits}?text=${message}`;
  };

  const handleOpenProfile = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setShowProfileModal(true);
  };

  const handleIniciarConsulta = (paciente: Paciente) => {
    if (paciente.agendamento) {
      router.push(`/medico/consultas/${paciente.agendamento.id}`);
    }
  };

  const getUrgencyColor = (urgencia: string) => {
    switch (urgencia?.toLowerCase()) {
      case 'alta': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderada': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const filteredPacientes = pacientes.filter(p => 
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.patologiaCID?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/medico')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Pacientes</h1>
            <p className="text-gray-500 text-sm">Visualize e gerencie seus pacientes</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou patologia..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            </div>
            
            <div className="flex gap-2">
              {(['todos', 'com-anamnese', 'agendados'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#3FA174] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'todos' ? 'Todos' : f === 'com-anamnese' ? 'Com Anamnese' : 'Agendados'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          {filteredPacientes.length} paciente(s) encontrado(s)
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        ) : filteredPacientes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum paciente encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacientes.map((paciente) => (
              <motion.div
                key={paciente.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#3FA174]/30 transition-all cursor-pointer group"
                onClick={() => handleOpenProfile(paciente)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(paciente.nome)} flex items-center justify-center text-white font-semibold text-sm`}>
                      {getInitials(paciente.nome)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#3FA174] transition-colors">
                        {paciente.nome}
                      </h3>
                      <p className="text-xs text-gray-500">{paciente.email}</p>
                    </div>
                  </div>
                  {paciente.agendamento && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      paciente.agendamento.status === 'AGENDADO' 
                        ? 'bg-blue-50 text-blue-600' 
                        : paciente.agendamento.status === 'EM_ANDAMENTO'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {paciente.agendamento.status === 'AGENDADO' ? 'Agendado' : 
                       paciente.agendamento.status === 'EM_ANDAMENTO' ? 'Em consulta' : 
                       paciente.agendamento.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {paciente.cidade && paciente.estado && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {paciente.cidade}/{paciente.estado}
                    </div>
                  )}
                  {paciente.patologiaCID && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart size={14} className="text-gray-400" />
                      {paciente.patologiaCID}
                    </div>
                  )}
                  {paciente.agendamento && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(paciente.agendamento.dataHora).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(paciente.agendamento.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {paciente.preAnamnese ? (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                      paciente.preAnamnese.diagnostico 
                        ? getUrgencyColor(paciente.preAnamnese.diagnostico.nivelUrgencia)
                        : 'border-green-200 text-green-600 bg-green-50'
                    }`}>
                      <FileText size={14} />
                      <span className="text-xs font-medium">
                        {paciente.preAnamnese.diagnostico 
                          ? `Urgência ${paciente.preAnamnese.diagnostico.nivelUrgencia}`
                          : 'Anamnese completa'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Sem anamnese</span>
                    </div>
                  )}
                  {paciente.jaUsaCannabis && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                      Usa cannabis
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={getWhatsAppLink(paciente.whatsapp, paciente.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  {paciente.agendamento && paciente.agendamento.status === 'AGENDADO' && (
                    <button
                      onClick={() => handleIniciarConsulta(paciente)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#3FA174] text-white rounded-lg hover:bg-[#359966] transition-colors text-sm font-medium"
                    >
                      <Video size={16} />
                      Iniciar
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showProfileModal && selectedPaciente && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-3xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedPaciente.nome)} flex items-center justify-center text-white font-bold text-xl`}>
                      {getInitials(selectedPaciente.nome)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedPaciente.nome}</h2>
                      <p className="text-gray-500">{selectedPaciente.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {selectedPaciente.jaUsaCannabis && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                            Usa cannabis
                          </span>
                        )}
                        {selectedPaciente.plano && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                            {selectedPaciente.plano.nome}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Phone size={14} />
                      WhatsApp
                    </div>
                    <p className="font-medium text-gray-900">{formatWhatsApp(selectedPaciente.whatsapp)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin size={14} />
                      Localização
                    </div>
                    <p className="font-medium text-gray-900">
                      {selectedPaciente.cidade && selectedPaciente.estado 
                        ? `${selectedPaciente.cidade}/${selectedPaciente.estado}` 
                        : 'Não informado'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Heart size={14} />
                      Patologia (CID)
                    </div>
                    <p className="font-medium text-gray-900">{selectedPaciente.patologiaCID || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar size={14} />
                      Paciente desde
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(selectedPaciente.criadoEm)}</p>
                  </div>
                </div>

                {selectedPaciente.agendamento && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-900">Próxima Consulta</h4>
                        <p className="text-blue-700">
                          {new Date(selectedPaciente.agendamento.dataHora).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {selectedPaciente.agendamento.status === 'AGENDADO' && (
                        <Button
                          onClick={() => handleIniciarConsulta(selectedPaciente)}
                          className="bg-[#3FA174] hover:bg-[#359966]"
                        >
                          <Video size={16} className="mr-2" />
                          Iniciar Consulta
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {selectedPaciente.preAnamnese ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={18} className="text-[#3FA174]" />
                        Pré-Anamnese Completa
                      </h3>
                    </div>
                    <div className="p-4 space-y-6">
                      {selectedPaciente.preAnamnese.diagnostico && (
                        <div className={`rounded-xl p-4 border ${getUrgencyColor(selectedPaciente.preAnamnese.diagnostico.nivelUrgencia)}`}>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Stethoscope size={16} />
                            {selectedPaciente.preAnamnese.diagnostico.titulo}
                          </h4>
                          <p className="text-sm mb-3">{selectedPaciente.preAnamnese.diagnostico.resumo}</p>
                          
                          {selectedPaciente.preAnamnese.diagnostico.indicacoes?.length > 0 && (
                            <div className="mb-2">
                              <span className="text-xs font-medium">Indicações:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedPaciente.preAnamnese.diagnostico.indicacoes.map((ind, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-white/50 rounded text-xs">{ind}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {selectedPaciente.preAnamnese.diagnostico.contraindicacoes?.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-red-600">Contraindicações:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedPaciente.preAnamnese.diagnostico.contraindicacoes.map((contra, i) => (
                                  <span key={i} className="px-2 py-0.5 bg-red-100 rounded text-xs text-red-700">{contra}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Target size={14} />
                            Objetivo Principal
                          </div>
                          <p className="font-medium text-gray-900">{selectedPaciente.preAnamnese.objetivoPrincipal}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Activity size={14} />
                            Intensidade dos Sintomas
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  selectedPaciente.preAnamnese.intensidadeSintomas >= 7 ? 'bg-red-500' :
                                  selectedPaciente.preAnamnese.intensidadeSintomas >= 4 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${selectedPaciente.preAnamnese.intensidadeSintomas * 10}%` }}
                              />
                            </div>
                            <span className="font-bold text-sm">{selectedPaciente.preAnamnese.intensidadeSintomas}/10</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Tempo dos Sintomas</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.tempoSintomas}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Frequência</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.frequenciaSintomas}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Experiência Cannabis</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.usouCannabis}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Idade</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.idade} anos</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Peso</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.peso} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Altura</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.altura} cm</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Moon size={14} />
                            Qualidade do Sono
                          </div>
                          <p className="font-medium">{selectedPaciente.preAnamnese.qualidadeSono}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Brain size={14} />
                            Nível de Estresse
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-purple-500"
                                style={{ width: `${selectedPaciente.preAnamnese.nivelEstresse * 10}%` }}
                              />
                            </div>
                            <span className="font-bold text-sm">{selectedPaciente.preAnamnese.nivelEstresse}/10</span>
                          </div>
                        </div>
                      </div>

                      {selectedPaciente.preAnamnese.condicoesSaude?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500">Condições de Saúde</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPaciente.preAnamnese.condicoesSaude.map((c, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.medicamentosAtuais?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Pill size={14} />
                            Medicamentos Atuais
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPaciente.preAnamnese.medicamentosAtuais.map((m, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.expectativasTratamento?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500">Expectativas do Tratamento</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedPaciente.preAnamnese.expectativasTratamento.map((e, i) => (
                              <span key={i} className="px-2 py-1 bg-[#3FA174]/10 text-[#3FA174] text-xs rounded-full">{e}</span>
                            ))}
                          </div>
                          {selectedPaciente.preAnamnese.expectativasOutro && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              &quot;{selectedPaciente.preAnamnese.expectativasOutro}&quot;
                            </p>
                          )}
                        </div>
                      )}

                      {selectedPaciente.preAnamnese.preocupacoes && (
                        <div>
                          <span className="text-sm text-gray-500">Preocupações do Paciente</span>
                          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg italic">
                            &quot;{selectedPaciente.preAnamnese.preocupacoes}&quot;
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-gray-500">Tabagismo</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.tabagismo}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Consumo de Álcool</span>
                          <p className="font-medium">{selectedPaciente.preAnamnese.alcool}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-6 text-center">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Pré-anamnese ainda não respondida</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <a
                    href={getWhatsAppLink(selectedPaciente.whatsapp, selectedPaciente.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    <MessageCircle size={18} />
                    Enviar WhatsApp
                  </a>
                  {selectedPaciente.agendamento && selectedPaciente.agendamento.status === 'AGENDADO' && (
                    <Button
                      onClick={() => handleIniciarConsulta(selectedPaciente)}
                      className="flex-1 bg-[#3FA174] hover:bg-[#359966] py-6"
                    >
                      <Video size={18} className="mr-2" />
                      Iniciar Teleconsulta
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
