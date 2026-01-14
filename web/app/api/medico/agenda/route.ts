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
      return NextResponse.json(
        { error: 'CRM não verificado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const inicio = searchParams.get('inicio');
    const fim = searchParams.get('fim');

    if (!inicio || !fim) {
      return NextResponse.json(
        { error: 'Parâmetros inicio e fim são obrigatórios' },
        { status: 400 }
      );
    }

    const consultas = await prisma.agendamento.findMany({
      where: {
        prescritorId: prescritor.id,
        dataHora: {
          gte: new Date(inicio),
          lt: new Date(fim),
        },
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
    });

    return NextResponse.json({
      consultas: consultas.map(c => ({
        id: c.id,
        dataHora: c.dataHora,
        duracao: c.duracao,
        tipo: c.tipo,
        status: c.status,
        paciente: c.paciente,
      })),
    });
  } catch (error) {
    console.error('Erro ao carregar agenda:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar agenda' },
      { status: 500 }
    );
  }
}
