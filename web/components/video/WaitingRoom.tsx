'use client';

import { useState, useEffect } from 'react';
import { Clock, Video, User, Calendar, Loader2 } from 'lucide-react';

interface WaitingRoomProps {
  agendamentoId: string;
  pacienteNome: string;
  medicoNome?: string;
  dataHora: Date;
  authToken: string;
  onConsultaLiberada: () => void;
}

export default function WaitingRoom({
  agendamentoId,
  pacienteNome,
  medicoNome,
  dataHora,
  authToken,
  onConsultaLiberada,
}: WaitingRoomProps) {
  const [checking, setChecking] = useState(false);
  const [tempoEspera, setTempoEspera] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTempoEspera(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const checkConsultaStatus = async () => {
      try {
        setChecking(true);
        const response = await fetch(`/api/consulta/${agendamentoId}/status`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const data = await response.json();

        if (data.status === 'EM_ANDAMENTO' || data.medicoPresente) {
          onConsultaLiberada();
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      } finally {
        setChecking(false);
      }
    };

    const pollInterval = setInterval(checkConsultaStatus, 5000);
    checkConsultaStatus();

    return () => clearInterval(pollInterval);
  }, [agendamentoId, authToken, onConsultaLiberada]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDataHora = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-verde-claro/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-10 h-10 text-verde-claro" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Sala de Espera Virtual
          </h1>
          <p className="text-gray-500">
            Aguarde o médico iniciar a consulta
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <User className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Paciente</p>
              <p className="font-medium text-gray-800">{pacienteNome}</p>
            </div>
          </div>

          {medicoNome && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <User className="w-5 h-5 text-verde-claro" />
              <div>
                <p className="text-sm text-gray-500">Médico</p>
                <p className="font-medium text-gray-800">{medicoNome}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Horário Agendado</p>
              <p className="font-medium text-gray-800">{formatDataHora(dataHora)}</p>
            </div>
          </div>
        </div>

        <div className="text-center p-6 bg-verde-claro/5 rounded-xl border border-verde-claro/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            {checking ? (
              <Loader2 className="w-5 h-5 text-verde-claro animate-spin" />
            ) : (
              <Clock className="w-5 h-5 text-verde-claro" />
            )}
            <span className="text-sm text-gray-600">Tempo de espera</span>
          </div>
          <p className="text-3xl font-mono font-bold text-verde-claro">
            {formatTime(tempoEspera)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Verificando a cada 5 segundos...
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Não feche esta página. Você será redirecionado automaticamente 
            quando o médico iniciar a consulta.
          </p>
        </div>
      </div>
    </div>
  );
}
