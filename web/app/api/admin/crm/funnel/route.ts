import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export type FunnelStage = 'leads' | 'associados' | 'pre_anamnese' | 'consulta_agendada' | 'consulta_realizada';

export interface FunnelCard {
  id: string;
  pacienteId: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  criadoEm: Date;
  diasNoEstagio: number;
  stage: FunnelStage;
  preAnamneseId?: string;
  proximaConsulta?: Date;
  totalConsultas?: number;
}

export interface FunnelData {
  leads: FunnelCard[];
  associados: FunnelCard[];
  pre_anamnese: FunnelCard[];
  consulta_agendada: FunnelCard[];
  consulta_realizada: FunnelCard[];
  counts: {
    leads: number;
    associados: number;
    pre_anamnese: number;
    consulta_agendada: number;
    consulta_realizada: number;
  };
}

function calcularDiasNoEstagio(dataReferencia: Date): number {
  const agora = new Date();
  const diff = agora.getTime() - dataReferencia.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isOnboardingComplete(paciente: any): boolean {
  return Boolean(
    paciente.cpf &&
    paciente.documentoIdentidadeUrl &&
    paciente.cep &&
    paciente.rua &&
    paciente.numero &&
    paciente.cidade &&
    paciente.estado
  );
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const dataInicio = url.searchParams.get('dataInicio');
    const dataFim = url.searchParams.get('dataFim');

    const whereBase: any = {
      usuario: {
        role: 'PACIENTE',
        ativo: true,
        deletadoEm: null,
      },
    };

    if (search) {
      whereBase.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dataInicio) {
      whereBase.criadoEm = {
        ...whereBase.criadoEm,
        gte: new Date(dataInicio),
      };
    }

    if (dataFim) {
      whereBase.criadoEm = {
        ...whereBase.criadoEm,
        lte: new Date(dataFim + 'T23:59:59'),
      };
    }

    const pacientes = await prisma.paciente.findMany({
      where: whereBase,
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true,
        usuarioId: true,
        nome: true,
        email: true,
        whatsapp: true,
        cidade: true,
        estado: true,
        cpf: true,
        cep: true,
        rua: true,
        numero: true,
        documentoIdentidadeUrl: true,
        criadoEm: true,
        preAnamnese: {
          select: {
            id: true,
            criadoEm: true,
          },
        },
        agendamentos: {
          select: {
            id: true,
            status: true,
            dataHora: true,
            criadoEm: true,
          },
          orderBy: { dataHora: 'asc' },
        },
        assinaturas: {
          select: {
            id: true,
            status: true,
            criadoEm: true,
          },
          where: {
            status: 'ATIVA',
          },
        },
      },
    });

    const funnel: FunnelData = {
      leads: [],
      associados: [],
      pre_anamnese: [],
      consulta_agendada: [],
      consulta_realizada: [],
      counts: {
        leads: 0,
        associados: 0,
        pre_anamnese: 0,
        consulta_agendada: 0,
        consulta_realizada: 0,
      },
    };

    for (const paciente of pacientes) {
      const onboardingCompleto = isOnboardingComplete(paciente);
      const temPreAnamnese = !!paciente.preAnamnese;
      const temAssinaturaAtiva = (paciente as any).assinaturas?.length > 0;
      const agendamentos = paciente.agendamentos || [];
      
      const consultasConcluidas = agendamentos.filter(
        (a: any) => a.status === 'CONCLUIDO'
      );
      const consultasAgendadas = agendamentos.filter(
        (a: any) => ['AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO'].includes(a.status)
      );

      let stage: FunnelStage;
      let dataReferencia: Date;
      let proximaConsulta: Date | undefined;

      if (consultasConcluidas.length > 0) {
        stage = 'consulta_realizada';
        const ultimaConcluida = consultasConcluidas[consultasConcluidas.length - 1];
        dataReferencia = new Date(ultimaConcluida.dataHora);
      } else if (consultasAgendadas.length > 0) {
        stage = 'consulta_agendada';
        const primeiraAgendada = consultasAgendadas[0];
        dataReferencia = new Date(primeiraAgendada.criadoEm);
        proximaConsulta = new Date(primeiraAgendada.dataHora);
      } else if (temPreAnamnese) {
        stage = 'pre_anamnese';
        dataReferencia = new Date(paciente.preAnamnese!.criadoEm);
      } else if (onboardingCompleto || temAssinaturaAtiva) {
        stage = 'associados';
        dataReferencia = new Date(paciente.criadoEm);
      } else {
        stage = 'leads';
        dataReferencia = new Date(paciente.criadoEm);
      }

      const card: FunnelCard = {
        id: paciente.usuarioId,
        pacienteId: paciente.id,
        nome: paciente.nome,
        email: paciente.email,
        whatsapp: paciente.whatsapp,
        cidade: paciente.cidade,
        estado: paciente.estado,
        criadoEm: paciente.criadoEm,
        diasNoEstagio: calcularDiasNoEstagio(dataReferencia),
        stage,
        preAnamneseId: paciente.preAnamnese?.id,
        proximaConsulta,
        totalConsultas: consultasConcluidas.length,
      };

      funnel[stage].push(card);
      funnel.counts[stage]++;
    }

    return NextResponse.json(funnel);

  } catch (error) {
    console.error('Erro ao buscar funil CRM:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do funil' },
      { status: 500 }
    );
  }
}
