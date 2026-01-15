'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  Video,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';

interface Consulta {
  id: string;
  dataHora: string;
  duracao: number;
  tipo: string;
  status: string;
  paciente: {
    id: string;
    nome: string;
    whatsapp: string;
  };
}

interface DiaAgenda {
  data: Date;
  consultas: Consulta[];
}

export default function MedicoAgendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [semanaAtual, setSemanaAtual] = useState(new Date());
  const [consultas, setConsultas] = useState<Consulta[]>([]);

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login-medico');
    }
  }, [router]);

  const getInicioSemana = (data: Date) => {
    const d = new Date(data);
    const dia = d.getDay();
    d.setDate(d.getDate() - dia);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const fetchConsultas = useCallback(async () => {
    try {
      setLoading(true);
      const inicio = getInicioSemana(semanaAtual);
      const fim = new Date(inicio);
      fim.setDate(fim.getDate() + 7);

      const response = await fetchWithMedicoAuth<{ consultas: Consulta[] }>(
        `/api/medico/agenda?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`
      );
      setConsultas(response.consultas || []);
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        router.replace('/login-medico');
        return;
      }
      toast.error('Erro ao carregar agenda');
    } finally {
      setLoading(false);
    }
  }, [router, semanaAtual]);

  useEffect(() => {
    fetchConsultas();
  }, [fetchConsultas]);

  const navegarSemana = (direcao: number) => {
    const novaSemana = new Date(semanaAtual);
    novaSemana.setDate(novaSemana.getDate() + (direcao * 7));
    setSemanaAtual(novaSemana);
  };

  const getDiasSemana = () => {
    const dias: DiaAgenda[] = [];
    const inicio = getInicioSemana(semanaAtual);

    for (let i = 0; i < 7; i++) {
      const data = new Date(inicio);
      data.setDate(data.getDate() + i);
      
      const consultasDoDia = consultas.filter(c => {
        const dataConsulta = new Date(c.dataHora);
        return dataConsulta.toDateString() === data.toDateString();
      }).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

      dias.push({ data, consultas: consultasDoDia });
    }

    return dias;
  };

  const formatDia = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  const formatDiaNumero = (data: Date) => {
    return data.getDate().toString().padStart(2, '0');
  };

  const formatMes = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isHoje = (data: Date) => {
    const hoje = new Date();
    return data.toDateString() === hoje.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'EM_ANDAMENTO': return 'bg-green-100 text-green-700 border-green-200';
      case 'CONCLUIDO': return 'bg-gray-100 text-gray-500 border-gray-200';
      case 'CANCELADO': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const dias = getDiasSemana();
  const inicioSemana = getInicioSemana(semanaAtual);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(fimSemana.getDate() + 6);

  return (
    <MedicoLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minha Agenda</h1>
            <p className="text-gray-500">
              {inicioSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {fimSemana.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navegarSemana(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSemanaAtual(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="sm" onClick={() => navegarSemana(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-3">
            {dias.map((dia, index) => (
              <motion.div
                key={dia.data.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`h-full ${isHoje(dia.data) ? 'ring-2 ring-verde-oliva' : ''}`}>
                  <CardHeader className={`p-3 text-center ${isHoje(dia.data) ? 'bg-verde-oliva text-white' : 'bg-gray-50'}`}>
                    <p className="text-xs uppercase font-medium">{formatDia(dia.data)}</p>
                    <p className="text-2xl font-bold">{formatDiaNumero(dia.data)}</p>
                    <p className="text-xs">{formatMes(dia.data)}</p>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    {dia.consultas.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">
                        Sem consultas
                      </p>
                    ) : (
                      dia.consultas.map(consulta => (
                        <Link
                          key={consulta.id}
                          href={`/medico/consultas?id=${consulta.id}`}
                          className={`block p-2 rounded-lg border text-xs ${getStatusColor(consulta.status)} hover:shadow-md transition-shadow`}
                        >
                          <p className="font-bold">{formatTime(consulta.dataHora)}</p>
                          <p className="truncate font-medium">{consulta.paciente.nome.split(' ')[0]}</p>
                          <p className="text-[10px] opacity-75">{consulta.duracao}min</p>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                <span className="text-sm text-gray-600">Confirmado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                <span className="text-sm text-gray-600">Em Andamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-200"></div>
                <span className="text-sm text-gray-600">Concluído</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                <span className="text-sm text-gray-600">Cancelado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MedicoLayout>
  );
}
