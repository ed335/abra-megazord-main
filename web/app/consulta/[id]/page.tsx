'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, ArrowLeft, Video, AlertCircle } from 'lucide-react';
import AgoraVideoCall from '@/components/video/AgoraVideoCall';
import WaitingRoom from '@/components/video/WaitingRoom';
import { getToken } from '@/lib/auth';

interface AgendamentoData {
  id: string;
  dataHora: string;
  status: string;
  salaId: string | null;
  medicoPresente: boolean;
  paciente: {
    nome: string;
  };
}

function ConsultaContent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendamento, setAgendamento] = useState<AgendamentoData | null>(null);
  const [emConsulta, setEmConsulta] = useState(false);

  const loadAgendamento = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/consulta/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Agendamento não encontrado');
      }

      const data = await response.json();
      setAgendamento(prev => prev ? { ...prev, ...data } : data);

      if (data.medicoPresente && data.salaId) {
        setEmConsulta(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamento');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAgendamento = async () => {
      try {
        const response = await fetch(`/api/minha-consulta/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAgendamento(data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAgendamento();
    loadAgendamento();
  }, [id, router, loadAgendamento]);

  const handleConsultaLiberada = useCallback(() => {
    setEmConsulta(true);
  }, []);

  const handleConsultaEncerrada = useCallback(() => {
    setEmConsulta(false);
    router.push('/dashboard?consulta=concluida');
  }, [router]);

  const handleEntrarConsulta = async () => {
    try {
      const token = getToken();
      const response = await fetch(`/api/consulta/${id}/entrar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      
      if (data.aguardando) {
        return;
      }

      if (data.success) {
        setEmConsulta(true);
      }
    } catch (err) {
      console.error('Erro ao entrar na consulta:', err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-verde-claro animate-spin" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white">
        
        <div className="max-w-md mx-auto py-20 px-4 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">Erro</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-verde-claro text-white rounded-lg hover:bg-verde-escuro transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (emConsulta && agendamento?.salaId) {
    return (
      <div className="h-screen bg-gray-900">
        <AgoraVideoCall
          channelName={agendamento.salaId}
          displayName={agendamento.paciente?.nome || 'Paciente'}
          onClose={handleConsultaEncerrada}
        />
      </div>
    );
  }

  if (agendamento && !agendamento.medicoPresente) {
    const token = getToken();
    return (
      <WaitingRoom
        agendamentoId={id}
        pacienteNome={agendamento.paciente?.nome || 'Paciente'}
        dataHora={new Date(agendamento.dataHora)}
        authToken={token || ''}
        onConsultaLiberada={handleConsultaLiberada}
      />
    );
  }

  return (
    <main className="min-h-screen bg-white">
      
      <div className="max-w-2xl mx-auto py-12 px-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <Video className="w-16 h-16 text-verde-claro mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Sua Consulta
          </h1>
          <p className="text-gray-600 mb-6">
            Clique no botão abaixo para entrar na sala de espera virtual.
          </p>

          <button
            onClick={handleEntrarConsulta}
            className="px-8 py-3 bg-verde-claro text-white font-medium rounded-xl hover:bg-verde-escuro transition"
          >
            Entrar na Consulta
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-verde-claro animate-spin" />
      </div>
    }>
      <ConsultaContent />
    </Suspense>
  );
}
