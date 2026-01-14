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

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const consultas = await prisma.agendamento.findMany({
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
    });

    return NextResponse.json({
      consultas: consultas.map(c => ({
        id: c.id,
        dataHora: c.dataHora,
        duracao: c.duracao,
        tipo: c.tipo,
        status: c.status,
        salaId: c.salaId,
        medicoPresente: c.medicoPresente,
        pacientePresente: c.pacientePresente,
        paciente: c.paciente,
      })),
    });
  } catch (error) {
    console.error('Erro ao carregar consultas de hoje:', error);
    return NextResponse.json(
      { error: 'Erro ao carregar consultas' },
      { status: 500 }
    );
  }
}
