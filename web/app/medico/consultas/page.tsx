'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  AlertCircle,
  FileText,
  ClipboardList,
} from 'lucide-react';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';
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
    id: string;
    nome: string;
    whatsapp: string;
    email: string;
  };
}

export default function MedicoConsultasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultaIdParam = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [consultaAtiva, setConsultaAtiva] = useState<Agendamento | null>(null);
  const [iniciandoConsulta, setIniciandoConsulta] = useState<string | null>(null);
  const [showPrescricaoModal, setShowPrescricaoModal] = useState(false);

  const loadAgendamentos = useCallback(async () => {
    try {
      const response = await fetchWithMedicoAuth<{ consultas: Agendamento[] }>(
        '/api/medico/consultas-hoje'
      );
      setAgendamentos(response.consultas || []);
      
      if (consultaIdParam) {
        const consulta = response.consultas?.find(c => c.id === consultaIdParam);
        if (consulta && consulta.status === 'EM_ANDAMENTO' && consulta.salaId) {
          setConsultaAtiva(consulta);
        }
      }
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        router.replace('/login');
        return;
      }
      console.error('Erro ao carregar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [consultaIdParam, router]);

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login');
      return;
    }
    loadAgendamentos();
    
    const interval = setInterval(loadAgendamentos, 15000);
    return () => clearInterval(interval);
  }, [router, loadAgendamentos]);

  const handleIniciarConsulta = async (agendamento: Agendamento) => {
    try {
      setIniciandoConsulta(agendamento.id);
      
      const token = getMedicoToken();
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
        toast.success('Consulta iniciada!');
      } else {
        toast.error(data.error || 'Erro ao iniciar consulta');
      }
    } catch (err) {
      console.error('Erro ao iniciar consulta:', err);
      toast.error('Erro ao iniciar consulta');
    } finally {
      setIniciandoConsulta(null);
    }
  };

  const handleEncerrarConsulta = async () => {
    if (!consultaAtiva) return;

    try {
      const token = getMedicoToken();
      await fetch(`/api/consulta/${consultaAtiva.id}/encerrar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Consulta encerrada');
      setShowPrescricaoModal(true);
    } catch (err) {
      console.error('Erro ao encerrar consulta:', err);
      toast.error('Erro ao encerrar consulta');
    }
  };

  const handleFinalizarSemPrescricao = () => {
    setConsultaAtiva(null);
    setShowPrescricaoModal(false);
    loadAgendamentos();
  };

  const handleIrParaPrescricao = () => {
    if (consultaAtiva) {
      router.push(`/medico/prescricao?consulta=${consultaAtiva.id}&paciente=${consultaAtiva.paciente.id}`);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO': return 'bg-green-100 text-green-700';
      case 'CONCLUIDO': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (showPrescricaoModal && consultaAtiva) {
    return (
      <MedicoLayout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Consulta Encerrada
              </h2>
              <p className="text-gray-600 mb-6">
                Consulta com {consultaAtiva.paciente.nome} finalizada com sucesso.
              </p>
              
              <div className="space-y-3">
                <Button
                  className="w-full bg-verde-oliva hover:bg-verde-oliva/90"
                  onClick={handleIrParaPrescricao}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Emitir Prescrição
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleFinalizarSemPrescricao}
                >
                  Finalizar sem Prescrição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MedicoLayout>
    );
  }

  if (consultaAtiva && consultaAtiva.salaId) {
    return (
      <div className="h-screen flex flex-col">
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Video className="w-6 h-6 text-green-400" />
            <div>
              <p className="font-medium">{consultaAtiva.paciente.nome}</p>
              <p className="text-sm text-gray-400">Consulta em andamento</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/medico/paciente/${consultaAtiva.paciente.id}`} target="_blank">
              <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10">
                <ClipboardList className="w-4 h-4 mr-2" />
                Ver Prontuário
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleEncerrarConsulta}
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Encerrar Consulta
            </Button>
          </div>
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
      <MedicoLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </MedicoLayout>
    );
  }

  return (
    <MedicoLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teleconsultas</h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {agendamentos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <VideoOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">
                Nenhuma consulta agendada
              </h2>
              <p className="text-gray-500 mb-4">
                Não há consultas confirmadas para hoje.
              </p>
              <Link href="/medico/agenda">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Agenda Completa
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <Card
                key={agendamento.id}
                className={`transition-shadow hover:shadow-md ${
                  agendamento.pacientePresente && !agendamento.medicoPresente
                    ? 'ring-2 ring-green-400 bg-green-50'
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                        <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <p className="text-2xl font-bold text-gray-800">
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
                          <Badge variant="outline">
                            {agendamento.tipo.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status === 'CONFIRMADO' && 'Confirmado'}
                        {agendamento.status === 'EM_ANDAMENTO' && 'Em Andamento'}
                        {agendamento.status === 'CONCLUIDO' && 'Concluído'}
                      </Badge>

                      {agendamento.pacientePresente && !agendamento.medicoPresente && (
                        <Badge className="bg-green-500 text-white animate-pulse">
                          Paciente na Sala
                        </Badge>
                      )}

                      <Link href={`/medico/paciente/${agendamento.paciente.id}`}>
                        <Button variant="outline" size="sm">
                          <ClipboardList className="w-4 h-4 mr-1" />
                          Prontuário
                        </Button>
                      </Link>

                      {agendamento.status === 'EM_ANDAMENTO' && agendamento.salaId ? (
                        <Button
                          onClick={() => setConsultaAtiva(agendamento)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Retomar
                        </Button>
                      ) : agendamento.status === 'CONFIRMADO' ? (
                        <Button
                          onClick={() => handleIniciarConsulta(agendamento)}
                          disabled={iniciandoConsulta === agendamento.id}
                          className="bg-verde-oliva hover:bg-verde-oliva/90"
                        >
                          {iniciandoConsulta === agendamento.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4 mr-2" />
                          )}
                          Iniciar Consulta
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {agendamento.pacientePresente && !agendamento.medicoPresente && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-100 px-4 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Paciente está aguardando na sala de espera!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MedicoLayout>
  );
}
