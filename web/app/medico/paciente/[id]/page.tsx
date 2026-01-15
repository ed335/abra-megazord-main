'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  ClipboardList,
  Video,
  Activity,
  Pill,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';

interface Agendamento {
  id: string;
  dataHora: string;
  tipo: string;
  status: string;
}

interface Prescricao {
  id: string;
  conteudo: string;
  criadoEm: string;
  status: string;
}

interface PreAnamnese {
  objetivoPrincipal: string;
  intensidadeSintomas: number;
  tempoSintomas: string;
  condicoesSaude: string[];
  medicamentosAtuais: string[];
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
  cpf: string | null;
  dataNascimento: string | null;
  preAnamnese: PreAnamnese[];
  agendamentos: Agendamento[];
  prescricoes: Prescricao[];
}

export default function MedicoPacienteProntuarioPage() {
  const router = useRouter();
  const params = useParams();
  const pacienteId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [showPreAnamnese, setShowPreAnamnese] = useState(true);
  const [showHistorico, setShowHistorico] = useState(true);

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login-medico');
      return;
    }

    const fetchPaciente = async () => {
      try {
        const response = await fetchWithMedicoAuth<{ paciente: Paciente }>(
          `/api/medico/paciente/${pacienteId}`
        );
        setPaciente(response.paciente);
      } catch (err: any) {
        if (err?.code === 'UNAUTHORIZED') {
          router.replace('/login-medico');
          return;
        }
        console.error('Erro ao carregar paciente:', err);
        toast.error('Erro ao carregar prontuário');
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [router, pacienteId]);

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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO': return 'bg-blue-100 text-blue-700';
      case 'CONCLUIDO': return 'bg-green-100 text-green-700';
      case 'CANCELADO': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  if (!paciente) {
    return (
      <MedicoLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">Paciente não encontrado</p>
          <Link href="/medico/pacientes">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </MedicoLayout>
    );
  }

  const preAnamnese = paciente.preAnamnese?.[0];

  return (
    <MedicoLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/medico/pacientes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prontuário do Paciente</h1>
            <p className="text-gray-500">Histórico médico e informações</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-verde-oliva/10 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-verde-oliva" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{paciente.nome}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {paciente.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {paciente.whatsapp}
                  </div>
                  {paciente.cpf && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      CPF: {paciente.cpf}
                    </div>
                  )}
                  {paciente.dataNascimento && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Nascimento: {formatDate(paciente.dataNascimento)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/medico/prescricao?paciente=${paciente.id}`}>
                  <Button size="sm" className="bg-verde-oliva hover:bg-verde-oliva/90">
                    <FileText className="w-4 h-4 mr-2" />
                    Nova Prescrição
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {preAnamnese && (
          <Card>
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setShowPreAnamnese(!showPreAnamnese)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-verde-oliva" />
                  Pré-Anamnese
                </CardTitle>
                {showPreAnamnese ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </CardHeader>
            {showPreAnamnese && (
              <CardContent className="space-y-4">
                {preAnamnese.diagnostico && (
                  <div className="bg-verde-oliva/5 border border-verde-oliva/20 rounded-lg p-4">
                    <h4 className="font-semibold text-verde-oliva mb-2">
                      {preAnamnese.diagnostico.titulo}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3">
                      {preAnamnese.diagnostico.resumo}
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Badge className={
                        preAnamnese.diagnostico.nivelUrgencia === 'alta' 
                          ? 'bg-red-100 text-red-700'
                          : preAnamnese.diagnostico.nivelUrgencia === 'media'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }>
                        Urgência: {preAnamnese.diagnostico.nivelUrgencia}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Indicações:</p>
                        <ul className="list-disc list-inside text-gray-600">
                          {preAnamnese.diagnostico.indicacoes.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Contraindicações:</p>
                        <ul className="list-disc list-inside text-gray-600">
                          {preAnamnese.diagnostico.contraindicacoes.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Objetivo Principal</p>
                    <p className="text-gray-600">{preAnamnese.objetivoPrincipal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Intensidade dos Sintomas</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-verde-oliva rounded-full" 
                          style={{ width: `${preAnamnese.intensidadeSintomas * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{preAnamnese.intensidadeSintomas}/10</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tempo dos Sintomas</p>
                    <p className="text-gray-600">{preAnamnese.tempoSintomas}</p>
                  </div>
                </div>

                {preAnamnese.condicoesSaude?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Condições de Saúde</p>
                    <div className="flex flex-wrap gap-2">
                      {preAnamnese.condicoesSaude.map((c, idx) => (
                        <Badge key={idx} variant="outline">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {preAnamnese.medicamentosAtuais?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Medicamentos em Uso</p>
                    <div className="flex flex-wrap gap-2">
                      {preAnamnese.medicamentosAtuais.map((m, idx) => (
                        <Badge key={idx} variant="secondary">
                          <Pill className="w-3 h-3 mr-1" />
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        )}

        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowHistorico(!showHistorico)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-verde-oliva" />
                Histórico de Consultas
              </CardTitle>
              {showHistorico ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
          {showHistorico && (
            <CardContent>
              {paciente.agendamentos.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhuma consulta registrada</p>
              ) : (
                <div className="space-y-3">
                  {paciente.agendamentos.map((agendamento) => (
                    <div 
                      key={agendamento.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDateTime(agendamento.dataHora)}
                          </p>
                          <p className="text-sm text-gray-500">{agendamento.tipo.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(agendamento.status)}>
                        {agendamento.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-verde-oliva" />
              Prescrições Emitidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paciente.prescricoes.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma prescrição emitida</p>
            ) : (
              <div className="space-y-3">
                {paciente.prescricoes.map((prescricao) => (
                  <div 
                    key={prescricao.id}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {formatDate(prescricao.criadoEm)}
                      </p>
                      <Badge className={
                        prescricao.status === 'ATIVA' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }>
                        {prescricao.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {typeof prescricao.conteudo === 'string' 
                        ? prescricao.conteudo.substring(0, 200) + '...'
                        : 'Conteúdo da prescrição'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MedicoLayout>
  );
}
