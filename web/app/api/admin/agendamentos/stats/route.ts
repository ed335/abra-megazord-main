import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date(hoje);
    fimHoje.setHours(23, 59, 59, 999);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);

    const [
      totalAgendamentos,
      agendamentosHoje,
      agendamentosSemana,
      agendamentosMes,
      porStatus,
      porTipo,
      proximosAgendamentos
    ] = await Promise.all([
      prisma.agendamento.count(),
      prisma.agendamento.count({
        where: {
          dataHora: { gte: hoje, lte: fimHoje }
        }
      }),
      prisma.agendamento.count({
        where: {
          dataHora: { gte: inicioSemana, lte: fimSemana }
        }
      }),
      prisma.agendamento.count({
        where: {
          dataHora: { gte: inicioMes, lte: fimMes }
        }
      }),
      prisma.agendamento.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.agendamento.groupBy({
        by: ['tipo'],
        _count: { tipo: true }
      }),
      prisma.agendamento.findMany({
        where: {
          dataHora: { gte: hoje },
          status: { in: ['AGENDADO', 'CONFIRMADO'] }
        },
        include: {
          paciente: {
            select: { nome: true, whatsapp: true }
          }
        },
        orderBy: { dataHora: 'asc' },
        take: 10
      })
    ]);

    const statusLabels: Record<string, string> = {
      AGENDADO: 'Agendado',
      CONFIRMADO: 'Confirmado',
      EM_ANDAMENTO: 'Em Andamento',
      CONCLUIDO: 'Concluído',
      CANCELADO: 'Cancelado',
      FALTOU: 'Faltou'
    };

    const tipoLabels: Record<string, string> = {
      PRIMEIRA_CONSULTA: 'Primeira Consulta',
      RETORNO: 'Retorno',
      ACOMPANHAMENTO: 'Acompanhamento',
      URGENTE: 'Urgente'
    };

    return NextResponse.json({
      resumo: {
        total: totalAgendamentos,
        hoje: agendamentosHoje,
        semana: agendamentosSemana,
        mes: agendamentosMes,
      },
      porStatus: porStatus.map(s => ({
        status: s.status,
        label: statusLabels[s.status] || s.status,
        count: s._count.status
      })),
      porTipo: porTipo.map(t => ({
        tipo: t.tipo,
        label: tipoLabels[t.tipo] || t.tipo,
        count: t._count.tipo
      })),
      proximosAgendamentos
    });
  } catch (err) {
    console.error('Erro ao buscar estatísticas:', err);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
