import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { planoId, meses } = body;

    if (!planoId) {
      return NextResponse.json({ error: 'Plano não informado' }, { status: 400 });
    }

    const paciente = await (prisma as any).paciente.findUnique({
      where: { id },
      include: { usuario: true }
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Associado não encontrado' }, { status: 404 });
    }

    const plano = await (prisma as any).plano.findUnique({
      where: { id: planoId }
    });

    if (!plano) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    const assinaturaExistente = await (prisma as any).assinatura.findFirst({
      where: {
        pacienteId: id,
        status: { in: ['ATIVA', 'PENDENTE'] }
      }
    });

    if (assinaturaExistente) {
      await (prisma as any).assinatura.update({
        where: { id: assinaturaExistente.id },
        data: { status: 'CANCELADA' }
      });
    }

    const dataInicio = new Date();
    const duracao = meses || 1;
    const dataFim = new Date(dataInicio);
    dataFim.setMonth(dataFim.getMonth() + duracao);
    const proximaCobranca = new Date(dataFim);

    const novaAssinatura = await (prisma as any).assinatura.create({
      data: {
        pacienteId: id,
        planoId: planoId,
        status: 'ATIVA',
        dataInicio,
        dataFim,
        proximaCobranca,
      },
      include: {
        plano: true
      }
    });

    return NextResponse.json({
      success: true,
      assinatura: {
        id: novaAssinatura.id,
        plano: novaAssinatura.plano.nome,
        dataInicio: novaAssinatura.dataInicio.toISOString(),
        dataFim: novaAssinatura.dataFim.toISOString(),
        status: novaAssinatura.status,
      }
    });

  } catch (error) {
    console.error('Erro ao atribuir plano:', error);
    return NextResponse.json({ error: 'Erro ao atribuir plano' }, { status: 500 });
  }
}
