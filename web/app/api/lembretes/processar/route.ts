import { NextRequest, NextResponse } from 'next/server';
import { gerarLembretesVencimentos, processarLembretesPendentes } from '@/lib/lembretes';
import { getAdminInfo } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const lembretesGerados = await gerarLembretesVencimentos();

    const { enviados, erros, ignorados } = await processarLembretesPendentes();

    return NextResponse.json({
      success: true,
      lembretesGerados,
      enviados,
      erros,
      ignorados,
      message: `Gerados: ${lembretesGerados}, Enviados: ${enviados}, Erros: ${erros}, Ignorados: ${ignorados}`,
    });
  } catch (error) {
    console.error('Erro ao processar lembretes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const { prisma } = await import('@/lib/prisma');

    const pendentes = await prisma.lembrete.count({
      where: { enviado: false },
    });

    const enviadosHoje = await prisma.lembrete.count({
      where: {
        enviado: true,
        enviadoEm: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const porTipo = await prisma.lembrete.groupBy({
      by: ['tipo'],
      where: { enviado: false },
      _count: true,
    });

    return NextResponse.json({
      pendentes,
      enviadosHoje,
      porTipo: porTipo.map(t => ({ tipo: t.tipo, count: t._count })),
    });
  } catch (error) {
    console.error('Erro ao obter estatisticas:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
