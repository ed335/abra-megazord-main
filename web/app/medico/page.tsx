'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Video,
  User,
  Phone,
  FileText,
  Loader2,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  ChevronRight,
  Bell,
  Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';

interface Paciente {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
}

interface Consulta {
  id: string;
  dataHora: string;
  duracao: number;
  tipo: string;
  status: string;
  pacientePresente: boolean;
  medicoPresente: boolean;
  salaId: string | null;
  paciente: Paciente;
}

interface DashboardData {
  success: boolean;
  pendingApproval: boolean;
  medico: {
    id?: string;
    nome: string;
    crm: string;
    especialidade: string;
  };
  metricas?: {
    consultasHoje: number;
    consultasSemana: number;
    totalPacientes: number;
    consultasRealizadasMes: number;
    prescricoesEmitidas: number;
    aguardandoSala: number;
  };
  consultasHoje?: Consulta[];
  proximaConsulta?: {
    id: string;
    dataHora: string;
    paciente: Paciente;
  } | null;
}

export default function MedicoDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login-medico');
      return;
    }
  }, [router]);

  const fetchDashboard = useCallback(async () => {
    try {
      const response = await fetchWithMedicoAuth<DashboardData>('/api/medico/dashboard');
      setData(response);
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        router.replace('/login-medico');
        return;
      }
      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO': return 'bg-green-100 text-green-700';
      case 'CONCLUIDO': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'Confirmado';
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'CONCLUIDO': return 'Concluído';
      default: return status;
    }
  };

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </MedicoLayout>
    );
  }

  if (data?.pendingApproval) {
    return (
      <MedicoLayout medico={data.medico}>
        <div className="max-w-2xl mx-auto mt-20">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-800 mb-2">
                Aguardando Aprovação
              </h2>
              <p className="text-amber-700 mb-4">
                Seu cadastro está em análise. Nossa equipe está verificando seu CRM junto ao 
                conselho regional de medicina. Este processo pode levar até 48 horas úteis.
              </p>
              <div className="bg-white rounded-lg p-4 inline-block">
                <p className="text-sm text-gray-600">CRM em verificação:</p>
                <p className="text-lg font-semibold text-gray-900">{data.medico.crm}</p>
                <p className="text-sm text-gray-500">{data.medico.especialidade}</p>
              </div>
              <p className="text-sm text-amber-600 mt-4">
                Você receberá um email assim que seu cadastro for aprovado.
              </p>
            </CardContent>
          </Card>
        </div>
      </MedicoLayout>
    );
  }

  return (
    <MedicoLayout medico={data?.medico}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, Dr(a). {data?.medico.nome?.split(' ')[0]}
            </h1>
            <p className="text-gray-500">
              {new Date().toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <Link href="/medico/consultas">
            <Button className="bg-verde-oliva hover:bg-verde-oliva/90">
              <Video className="w-4 h-4 mr-2" />
              Iniciar Teleconsulta
            </Button>
          </Link>
        </div>

        {data?.metricas?.aguardandoSala && data.metricas.aguardandoSala > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Paciente na sala de espera!</p>
                <p className="text-sm text-white/80">
                  {data.metricas.aguardandoSala} paciente(s) aguardando você entrar na consulta
                </p>
              </div>
            </div>
            <Link href="/medico/consultas">
              <Button variant="secondary" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" />
                Entrar na Sala
              </Button>
            </Link>
          </motion.div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.metricas?.consultasHoje || 0}
                  </p>
                  <p className="text-xs text-gray-500">Consultas Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.metricas?.consultasSemana || 0}
                  </p>
                  <p className="text-xs text-gray-500">Esta Semana</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.metricas?.totalPacientes || 0}
                  </p>
                  <p className="text-xs text-gray-500">Pacientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {data?.metricas?.prescricoesEmitidas || 0}
                  </p>
                  <p className="text-xs text-gray-500">Prescrições/Mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-verde-oliva" />
                    Agenda de Hoje
                  </CardTitle>
                  <Link href="/medico/agenda">
                    <Button variant="ghost" size="sm">
                      Ver Agenda Completa
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {!data?.consultasHoje || data.consultasHoje.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma consulta agendada para hoje</p>
                    <Link href="/medico/agenda" className="text-verde-oliva text-sm hover:underline">
                      Ver próximos agendamentos
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.consultasHoje.map((consulta, index) => (
                      <motion.div
                        key={consulta.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border ${
                          consulta.pacientePresente && !consulta.medicoPresente
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                      >
                        <div className="text-center min-w-[60px]">
                          <p className="text-xl font-bold text-gray-900">
                            {formatTime(consulta.dataHora)}
                          </p>
                          <p className="text-xs text-gray-500">{consulta.duracao} min</p>
                        </div>
                        
                        <div className="w-12 h-12 bg-verde-oliva/10 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-verde-oliva" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {consulta.paciente.nome}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {consulta.paciente.whatsapp}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(consulta.status)}>
                            {getStatusLabel(consulta.status)}
                          </Badge>
                          
                          {consulta.pacientePresente && !consulta.medicoPresente && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              Na Sala
                            </Badge>
                          )}
                        </div>

                        <Link href={`/medico/consultas?id=${consulta.id}`}>
                          <Button
                            size="sm"
                            className={
                              consulta.pacientePresente && !consulta.medicoPresente
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-verde-oliva hover:bg-verde-oliva/90'
                            }
                          >
                            <Video className="w-4 h-4 mr-1" />
                            {consulta.status === 'EM_ANDAMENTO' ? 'Continuar' : 'Iniciar'}
                          </Button>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {data?.proximaConsulta && (
              <Card className="border-verde-oliva/20 bg-verde-oliva/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-verde-oliva flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Próxima Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {data.proximaConsulta.paciente.nome}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(data.proximaConsulta.dataHora)}
                      </p>
                      <p className="text-2xl font-bold text-verde-oliva">
                        {formatTime(data.proximaConsulta.dataHora)}
                      </p>
                    </div>
                    <Link href={`/medico/paciente/${data.proximaConsulta.paciente.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Ver Prontuário
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/medico/pacientes" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Buscar Paciente
                  </Button>
                </Link>
                <Link href="/medico/agenda" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerenciar Agenda
                  </Button>
                </Link>
                <Link href="/medico/prescricoes" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Nova Prescrição
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Resumo do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Consultas realizadas</span>
                    <span className="font-semibold">{data?.metricas?.consultasRealizadasMes || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Prescrições emitidas</span>
                    <span className="font-semibold">{data?.metricas?.prescricoesEmitidas || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Pacientes atendidos</span>
                    <span className="font-semibold">{data?.metricas?.totalPacientes || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MedicoLayout>
  );
}
