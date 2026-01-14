import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { id } = params;

    const medico = await prisma.prescritor.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            ativo: true,
            criadoEm: true,
          },
        },
        agendamentos: {
          orderBy: { dataHora: 'desc' },
          take: 10,
          include: {
            paciente: {
              select: {
                nome: true,
                email: true,
              },
            },
          },
        },
        prescricoes: {
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
        disponibilidades: true,
        _count: {
          select: {
            agendamentos: true,
            prescricoes: true,
          },
        },
      },
    });

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }

    const consultasRealizadas = await prisma.agendamento.count({
      where: {
        prescritorId: id,
        status: 'REALIZADA',
      },
    });

    return NextResponse.json({
      medico: {
        ...medico,
        consultasRealizadas,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar médico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médico' },
      { status: 500 }
    );
  }
}
