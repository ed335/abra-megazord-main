import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || '';
  const tipo = searchParams.get('tipo') || '';
  const dataInicio = searchParams.get('dataInicio') || '';
  const dataFim = searchParams.get('dataFim') || '';
  const pacienteId = searchParams.get('pacienteId') || '';

  const where: Record<string, unknown> = {};

  if (status) {
    if (status.includes(',')) {
      where.status = { in: status.split(',') };
    } else {
      where.status = status;
    }
  }

  if (tipo) {
    where.tipo = tipo;
  }

  if (pacienteId) {
    where.pacienteId = pacienteId;
  }

  if (dataInicio || dataFim) {
    where.dataHora = {};
    if (dataInicio) {
      (where.dataHora as Record<string, Date>).gte = new Date(dataInicio);
    }
    if (dataFim) {
      (where.dataHora as Record<string, Date>).lte = new Date(dataFim + 'T23:59:59');
    }
  }

  try {
    const [agendamentos, total] = await Promise.all([
      prisma.agendamento.findMany({
        where,
        include: {
          paciente: {
            select: { id: true, nome: true, email: true, whatsapp: true, patologiaCID: true }
          }
        },
        orderBy: { dataHora: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.agendamento.count({ where }),
    ]);

    return NextResponse.json({
      agendamentos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Erro ao buscar agendamentos:', err);
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const decoded = await verifyAdminToken(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pacienteId, dataHora, duracao, tipo, motivo, observacoes, linkVideo } = body;

    if (!pacienteId || !dataHora) {
      return NextResponse.json({ error: 'Paciente e data/hora são obrigatórios' }, { status: 400 });
    }

    const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        pacienteId,
        dataHora: new Date(dataHora),
        duracao: duracao || 30,
        tipo: tipo || 'PRIMEIRA_CONSULTA',
        motivo,
        observacoes,
        linkVideo,
      },
      include: {
        paciente: {
          select: { id: true, nome: true, email: true, whatsapp: true }
        }
      }
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'CRIAR',
      recurso: 'AGENDAMENTO',
      recursoId: agendamento.id,
      detalhes: { pacienteId, dataHora, tipo }
    });

    return NextResponse.json(agendamento, { status: 201 });
  } catch (err) {
    console.error('Erro ao criar agendamento:', err);
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 });
  }
}
