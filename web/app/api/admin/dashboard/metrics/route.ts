import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '30'; // dias
    const diasPeriodo = parseInt(periodo);

    const now = new Date();
    const startDate = new Date(now.getTime() - diasPeriodo * 24 * 60 * 60 * 1000);
    const previousStartDate = new Date(startDate.getTime() - diasPeriodo * 24 * 60 * 60 * 1000);

    const [
      // Métricas de receita
      receitaAtual,
      receitaAnterior,
      receitaPorTipo,
      receitaMensal,
      
      // Métricas de assinaturas
      assinaturasAtivas,
      assinaturasNovas,
      assinaturasCanceladas,
      assinaturasExpirando,
      
      // Métricas de consultas
      consultasRealizadas,
      consultasAgendadas,
      consultasCanceladas,
      
      // Funil de conversão
      totalCadastros,
      cadastrosComPreAnamnese,
      cadastrosComAssinatura,
      cadastrosComConsulta,
      
      // Top planos
      assinaturasPorPlano,
      
      // Pagamentos pendentes
      pagamentosPendentes,
      
      // Atividade recente
      atividadeRecente,
    ] = await Promise.all([
      // Receita período atual
      prisma.pagamento.aggregate({
        where: {
          status: 'PAGO',
          pagoEm: { gte: startDate }
        },
        _sum: { valor: true },
        _count: true
      }),
      
      // Receita período anterior
      prisma.pagamento.aggregate({
        where: {
          status: 'PAGO',
          pagoEm: { gte: previousStartDate, lt: startDate }
        },
        _sum: { valor: true }
      }),
      
      // Receita por tipo de pagamento
      prisma.pagamento.groupBy({
        by: ['tipo'],
        where: {
          status: 'PAGO',
          pagoEm: { gte: startDate }
        },
        _sum: { valor: true },
        _count: true
      }),
      
      // Receita mensal (últimos 12 meses)
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("pagoEm", 'YYYY-MM') as mes,
          SUM(valor)::numeric as valor,
          COUNT(*)::int as quantidade
        FROM "Pagamento"
        WHERE status = 'PAGO' AND "pagoEm" >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR("pagoEm", 'YYYY-MM')
        ORDER BY mes ASC
      ` as Promise<{ mes: string; valor: number; quantidade: number }[]>,
      
      // Assinaturas ativas
      prisma.assinatura.count({
        where: { status: 'ATIVA' }
      }),
      
      // Novas assinaturas no período
      prisma.assinatura.count({
        where: {
          criadoEm: { gte: startDate },
          status: 'ATIVA'
        }
      }),
      
      // Assinaturas canceladas no período
      prisma.assinatura.count({
        where: {
          atualizadoEm: { gte: startDate },
          status: 'CANCELADA'
        }
      }),
      
      // Assinaturas expirando em 7 dias
      prisma.assinatura.count({
        where: {
          status: 'ATIVA',
          dataFim: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Consultas realizadas
      prisma.agendamento.count({
        where: {
          status: 'CONCLUIDO',
          dataHora: { gte: startDate }
        }
      }),
      
      // Consultas agendadas (futuras)
      prisma.agendamento.count({
        where: {
          status: { in: ['AGENDADO', 'CONFIRMADO'] },
          dataHora: { gte: now }
        }
      }),
      
      // Consultas canceladas
      prisma.agendamento.count({
        where: {
          status: 'CANCELADO',
          atualizadoEm: { gte: startDate }
        }
      }),
      
      // Total cadastros no período
      prisma.paciente.count({
        where: { criadoEm: { gte: startDate } }
      }),
      
      // Cadastros com pré-anamnese
      prisma.paciente.count({
        where: {
          criadoEm: { gte: startDate },
          preAnamnese: { isNot: null }
        }
      }),
      
      // Cadastros com assinatura ativa
      prisma.paciente.count({
        where: {
          criadoEm: { gte: startDate },
          assinaturas: { some: { status: 'ATIVA' } }
        }
      }),
      
      // Cadastros com consulta realizada
      prisma.paciente.count({
        where: {
          criadoEm: { gte: startDate },
          agendamentos: { some: { status: 'CONCLUIDO' } }
        }
      }),
      
      // Assinaturas por plano
      prisma.assinatura.groupBy({
        by: ['planoId'],
        where: { status: 'ATIVA' },
        _count: true
      }),
      
      // Pagamentos pendentes
      prisma.pagamento.findMany({
        where: {
          status: { in: ['PENDENTE', 'PROCESSANDO'] },
          pixExpiracao: { gte: now }
        },
        include: {
          paciente: { select: { nome: true, email: true } }
        },
        orderBy: { criadoEm: 'desc' },
        take: 10
      }),
      
      // Atividade recente (logs)
      prisma.logAuditoria.findMany({
        where: {
          criadoEm: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        },
        include: {
          usuario: { select: { email: true } }
        },
        orderBy: { criadoEm: 'desc' },
        take: 20
      })
    ]);

    // Buscar nomes dos planos
    const planoIds = assinaturasPorPlano.map(a => a.planoId);
    const planos = await prisma.plano.findMany({
      where: { id: { in: planoIds } },
      select: { id: true, nome: true, valorMensalidade: true }
    });

    const planoMap = new Map(planos.map(p => [p.id, p]));

    // Calcular variações
    const receitaAtualValor = Number(receitaAtual._sum.valor || 0);
    const receitaAnteriorValor = Number(receitaAnterior._sum.valor || 0);
    const variacaoReceita = receitaAnteriorValor > 0 
      ? ((receitaAtualValor - receitaAnteriorValor) / receitaAnteriorValor) * 100 
      : receitaAtualValor > 0 ? 100 : 0;

    // Calcular taxas de conversão do funil
    const taxaPreAnamnese = totalCadastros > 0 ? (cadastrosComPreAnamnese / totalCadastros) * 100 : 0;
    const taxaAssinatura = cadastrosComPreAnamnese > 0 ? (cadastrosComAssinatura / cadastrosComPreAnamnese) * 100 : 0;
    const taxaConsulta = cadastrosComAssinatura > 0 ? (cadastrosComConsulta / cadastrosComAssinatura) * 100 : 0;
    const taxaConversaoTotal = totalCadastros > 0 ? (cadastrosComConsulta / totalCadastros) * 100 : 0;

    // MRR (Monthly Recurring Revenue)
    const mrr = planos.reduce((acc, plano) => {
      const count = assinaturasPorPlano.find(a => a.planoId === plano.id)?._count || 0;
      return acc + (Number(plano.valorMensalidade) * count);
    }, 0);

    return NextResponse.json({
      periodo: diasPeriodo,
      
      financeiro: {
        receita: receitaAtualValor,
        receitaAnterior: receitaAnteriorValor,
        variacaoReceita: Math.round(variacaoReceita * 10) / 10,
        totalTransacoes: receitaAtual._count,
        mrr,
        receitaPorTipo: receitaPorTipo.map(r => ({
          tipo: r.tipo,
          valor: Number(r._sum.valor || 0),
          quantidade: r._count
        })),
        receitaMensal: receitaMensal.map(r => ({
          mes: r.mes,
          valor: Number(r.valor || 0),
          quantidade: Number(r.quantidade)
        }))
      },
      
      assinaturas: {
        ativas: assinaturasAtivas,
        novas: assinaturasNovas,
        canceladas: assinaturasCanceladas,
        expirando: assinaturasExpirando,
        churnRate: assinaturasAtivas > 0 ? Math.round((assinaturasCanceladas / assinaturasAtivas) * 100 * 10) / 10 : 0,
        porPlano: assinaturasPorPlano.map(a => ({
          planoId: a.planoId,
          planoNome: planoMap.get(a.planoId)?.nome || 'Desconhecido',
          quantidade: a._count
        }))
      },
      
      consultas: {
        realizadas: consultasRealizadas,
        agendadas: consultasAgendadas,
        canceladas: consultasCanceladas,
        taxaCancelamento: (consultasRealizadas + consultasCanceladas) > 0 
          ? Math.round((consultasCanceladas / (consultasRealizadas + consultasCanceladas)) * 100 * 10) / 10 
          : 0
      },
      
      funil: {
        cadastros: totalCadastros,
        preAnamnese: cadastrosComPreAnamnese,
        assinaturas: cadastrosComAssinatura,
        consultas: cadastrosComConsulta,
        taxas: {
          preAnamnese: Math.round(taxaPreAnamnese * 10) / 10,
          assinatura: Math.round(taxaAssinatura * 10) / 10,
          consulta: Math.round(taxaConsulta * 10) / 10,
          total: Math.round(taxaConversaoTotal * 10) / 10
        }
      },
      
      alertas: {
        pagamentosPendentes: pagamentosPendentes.length,
        assinaturasExpirando,
        consultasHoje: await prisma.agendamento.count({
          where: {
            status: { in: ['AGENDADO', 'CONFIRMADO'] },
            dataHora: {
              gte: new Date(now.setHours(0, 0, 0, 0)),
              lt: new Date(now.setHours(23, 59, 59, 999))
            }
          }
        })
      },
      
      pagamentosPendentes: pagamentosPendentes.map(p => ({
        id: p.id,
        valor: Number(p.valor),
        tipo: p.tipo,
        paciente: p.paciente.nome,
        email: p.paciente.email,
        expiracao: p.pixExpiracao,
        criadoEm: p.criadoEm
      })),
      
      atividadeRecente: atividadeRecente.map(a => ({
        id: a.id,
        acao: a.acao,
        recurso: a.recurso,
        usuario: a.usuario?.email || 'Sistema',
        criadoEm: a.criadoEm
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar métricas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar métricas' },
      { status: 500 }
    );
  }
}
