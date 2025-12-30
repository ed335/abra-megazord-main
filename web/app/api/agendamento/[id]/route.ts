import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jwt.verify(token, jwtSecret) as { sub: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const agendamento = await prisma.agendamento.findUnique({
      where: { id: params.id },
      include: {
        prescritor: {
          include: {
            usuario: true,
          },
        },
        paciente: true,
      },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: decoded.sub },
      include: {
        assinaturas: {
          where: { status: 'ATIVA' },
          include: { plano: true },
          take: 1,
        },
      },
    });

    if (!paciente || paciente.id !== agendamento.pacienteId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const assinatura = paciente.assinaturas?.[0];
    const plano = assinatura?.plano;
    
    const valorConsulta = plano ? Number(plano.valorConsulta) : 149.00;
    const desconto = assinatura ? 30 : 0;
    const valorComDesconto = valorConsulta * (1 - desconto / 100);

    return NextResponse.json({
      agendamento: {
        id: agendamento.id,
        dataHora: agendamento.dataHora,
        status: agendamento.status,
        tipo: agendamento.tipo,
        medico: {
          nome: agendamento.prescritor?.nome || 'Médico ABRACANM',
          especialidade: agendamento.prescritor?.especialidade || 'Medicina Integrativa',
        },
        valorConsulta,
        valorComDesconto,
        desconto,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar agendamento' },
      { status: 500 }
    );
  }
}
