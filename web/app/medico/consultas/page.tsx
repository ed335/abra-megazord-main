'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  Video, 
  VideoOff, 
  Calendar,
  Clock,
  User,
  Phone,
  PlayCircle,
  StopCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getAdminToken, fetchWithAdminAuth } from '@/lib/admin-auth-client';
import AgoraVideoCall from '@/components/video/AgoraVideoCall';

interface Agendamento {
  id: string;
  dataHora: string;
  duracao: number;
  tipo: string;
  status: string;
  salaId: string | null;
  medicoPresente: boolean;
  pacientePresente: boolean;
  paciente: {
    nome: string;
    whatsapp: string;
    email: string;
  };
}

export default function MedicoConsultasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [consultaAtiva, setConsultaAtiva] = useState<Agendamento | null>(null);
  const [iniciandoConsulta, setIniciandoConsulta] = useState<string | null>(null);

  const loadAgendamentos = useCallback(async () => {
    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      const data = await fetchWithAdminAuth<{ agendamentos: Agendamento[] }>(
        `/api/admin/agendamentos?data=${hoje.toISOString()}&status=CONFIRMADO,EM_ANDAMENTO`
      );
      
      setAgendamentos(data.agendamentos || []);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    loadAgendamentos();
  }, [router, loadAgendamentos]);

  const handleIniciarConsulta = async (agendamento: Agendamento) => {
    try {
      setIniciandoConsulta(agendamento.id);
      
      const token = getAdminToken();
      const response = await fetch(`/api/consulta/${agendamento.id}/iniciar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setConsultaAtiva({
          ...agendamento,
          salaId: data.salaId,
          medicoPresente: true,
        });
      }
    } catch (err) {
      console.error('Erro ao iniciar consulta:', err);
    } finally {
      setIniciandoConsulta(null);
    }
  };

  const handleEncerrarConsulta = async () => {
    if (!consultaAtiva) return;

    try {
      const token = getAdminToken();
      await fetch(`/api/consulta/${consultaAtiva.id}/encerrar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      setConsultaAtiva(null);
      loadAgendamentos();
    } catch (err) {
      console.error('Erro ao encerrar consulta:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      CONFIRMADO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle2 },
      EM_ANDAMENTO: { bg: 'bg-green-100', text: 'text-green-700', icon: Video },
      CONCLUIDO: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle2 },
    };
    const c = config[status] || config.CONFIRMADO;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (consultaAtiva && consultaAtiva.salaId) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Video className="w-6 h-6 text-verde-claro" />
            <div>
              <p className="font-medium">{consultaAtiva.paciente.nome}</p>
              <p className="text-sm text-gray-400">Consulta em andamento</p>
            </div>
          </div>
          <button
            onClick={handleEncerrarConsulta}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            <StopCircle className="w-4 h-4" />
            Encerrar Consulta
          </button>
        </div>
        <div className="flex-1">
          <AgoraVideoCall
            channelName={consultaAtiva.salaId}
            displayName="Dr. ABRACANM"
            onClose={handleEncerrarConsulta}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-verde-claro animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Teleconsultas</h1>
              <p className="text-sm text-gray-500">Gerencie suas consultas do dia</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {agendamentos.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <VideoOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-800 mb-2">
              Nenhuma consulta agendada
            </h2>
            <p className="text-gray-500">
              Não há consultas confirmadas para hoje.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-800">
                        {formatTime(agendamento.dataHora)}
                      </p>
                      <p className="text-xs text-gray-500">{agendamento.duracao} min</p>
                    </div>

                    <div className="border-l border-gray-200 pl-6">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-medium text-gray-800">
                          {agendamento.paciente.nome}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {agendamento.paciente.whatsapp}
                        </span>
                        <span>{agendamento.tipo.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(agendamento.status)}

                    {agendamento.status === 'EM_ANDAMENTO' ? (
                      <button
                        onClick={() => setConsultaAtiva(agendamento)}
                        className="flex items-center gap-2 px-4 py-2 bg-verde-claro text-white rounded-lg hover:bg-verde-escuro transition"
                      >
                        <Video className="w-4 h-4" />
                        Retomar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleIniciarConsulta(agendamento)}
                        disabled={iniciandoConsulta === agendamento.id}
                        className="flex items-center gap-2 px-4 py-2 bg-verde-claro text-white rounded-lg hover:bg-verde-escuro transition disabled:opacity-50"
                      >
                        {iniciandoConsulta === agendamento.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PlayCircle className="w-4 h-4" />
                        )}
                        Iniciar Consulta
                      </button>
                    )}
                  </div>
                </div>

                {agendamento.pacientePresente && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    Paciente está na sala de espera
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
