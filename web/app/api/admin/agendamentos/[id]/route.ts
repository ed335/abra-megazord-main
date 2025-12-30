import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const agendamento = await prisma.agendamento.findUnique({
      where: { id: params.id },
      include: {
        paciente: {
          select: { id: true, nome: true, email: true, whatsapp: true, patologiaCID: true, cidade: true, estado: true }
        }
      }
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(agendamento);
  } catch (err) {
    console.error('Erro ao buscar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao buscar agendamento' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dataHora, duracao, tipo, status, motivo, observacoes, linkVideo } = body;

    const agendamentoAtual = await prisma.agendamento.findUnique({ where: { id: params.id } });
    if (!agendamentoAtual) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (dataHora) updateData.dataHora = new Date(dataHora);
    if (duracao) updateData.duracao = duracao;
    if (tipo) updateData.tipo = tipo;
    if (status) {
      updateData.status = status;
      if (status === 'CONFIRMADO') {
        updateData.confirmadoEm = new Date();
      }
    }
    if (motivo !== undefined) updateData.motivo = motivo;
    if (observacoes !== undefined) updateData.observacoes = observacoes;
    if (linkVideo !== undefined) updateData.linkVideo = linkVideo;

    const agendamento = await prisma.agendamento.update({
      where: { id: params.id },
      data: updateData,
      include: {
        paciente: {
          select: { id: true, nome: true, email: true, whatsapp: true }
        }
      }
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'ATUALIZAR',
      recurso: 'AGENDAMENTO',
      recursoId: params.id,
      detalhes: { anterior: agendamentoAtual, novo: agendamento }
    });

    return NextResponse.json(agendamento);
  } catch (err) {
    console.error('Erro ao atualizar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const agendamento = await prisma.agendamento.findUnique({ where: { id: params.id } });
    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    await prisma.agendamento.delete({ where: { id: params.id } });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'EXCLUIR',
      recurso: 'AGENDAMENTO',
      recursoId: params.id,
      detalhes: { agendamento }
    });

    return NextResponse.json({ message: 'Agendamento excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir agendamento:', err);
    return NextResponse.json({ error: 'Erro ao excluir agendamento' }, { status: 500 });
  }
}
