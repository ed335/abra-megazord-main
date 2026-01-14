import { NextRequest, NextResponse } from 'next/server';
import { verifyMedicoToken, getMedicoPrismaClient } from '@/lib/medico-auth';

export const dynamic = 'force-dynamic';

const prisma = getMedicoPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyMedicoToken(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { prescritor } = auth;

    if (!prescritor.crmVerificado) {
      return NextResponse.json({
        success: true,
        pendingApproval: true,
        medico: {
          nome: prescritor.nome,
          crm: prescritor.crm,
          especialidade: prescritor.especialidade,
        },
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 7);

    const [
      consultasHoje,
      consultasSemana,
      proximaConsulta,
      aguardandoSala,
      totalPacientes,
      consultasRealizadasMes,
      prescricoesEmitidas,
    ] = await Promise.all([
      prisma.agendamento.findMany({
        where: {
          prescritorId: prescritor.id,
          dataHora: { gte: hoje, lt: amanha },
          status: { in: ['CONFIRMADO', 'EM_ANDAMENTO'] },
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              email: true,
              whatsapp: true,
            },
          },
        },
        orderBy: { dataHora: 'asc' },
      }),
      prisma.agendamento.count({
        where: {
          prescritorId: prescritor.id,
          dataHora: { gte: inicioSemana, lt: fimSemana },
          status: { in: ['CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO'] },
        },
      }),
      prisma.agendamento.findFirst({
        where: {
          prescritorId: prescritor.id,
          dataHora: { gte: new Date() },
          status: 'CONFIRMADO',
        },
        include: {
          paciente: {
            select: {
              id: true,
              nome: true,
              whatsapp: true,
            },
          },
        },
        orderBy: { dataHora: 'asc' },
      }),
      prisma.agendamento.count({
        where: {
          prescritorId: prescritor.id,
          status: 'EM_ANDAMENTO',
          pacientePresente: true,
          medicoPresente: false,
        },
      }),
      prisma.agendamento.groupBy({
        by: ['pacienteId'],
        where: {
          prescritorId: prescritor.id,
          status: 'CONCLUIDO',
        },
      }).then(r => r.length),
      prisma.agendamento.count({
        where: {
          prescritorId: prescritor.id,
          status: 'CONCLUIDO',
          dataHora: {
            gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
          },
        },
      }),
      prisma.prescricao.count({
        where: {
          prescritorId: prescritor.id,
          criadoEm: {
            gte: new Date(hoje.getFullYear(), hoje.getMonth(), 1),
          },
        },
      }),
    ]);

    const consultasHojeFormatadas = consultasHoje.map(c => ({
      id: c.id,
      dataHora: c.dataHora,
      duracao: c.duracao,
      tipo: c.tipo,
      status: c.status,
      pacientePresente: c.pacientePresente,
      medicoPresente: c.medicoPresente,
      salaId: c.salaId,
      paciente: c.paciente,
    }));

    return NextResponse.json({
      success: true,
      pendingApproval: false,
      medico: {
        id: prescritor.id,
        nome: prescritor.nome,
        crm: prescritor.crm,
        especialidade: prescritor.especialidade,
      },
      metricas: {
        consultasHoje: consultasHoje.length,
        consultasSemana,
        totalPacientes,
        consultasRealizadasMes,
        prescricoesEmitidas,
        aguardandoSala,
      },
      consultasHoje: consultasHojeFormatadas,
      proximaConsulta: proximaConsulta ? {
        id: proximaConsulta.id,
        dataHora: proximaConsulta.dataHora,
        paciente: proximaConsulta.paciente,
      } : null,
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard do médico:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar dashboard' },
      { status: 500 }
    );
  }
}
