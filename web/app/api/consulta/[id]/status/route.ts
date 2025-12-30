import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jsonwebtoken from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return secret;
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string; role?: string };
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

    const agendamento = await (prisma as any).agendamento.findUnique({
      where: { id: params.id },
      include: { paciente: true },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    if (decoded.role !== 'ADMIN') {
      const paciente = await (prisma as any).paciente.findUnique({
        where: { usuarioId: decoded.sub },
      });

      if (!paciente || agendamento.pacienteId !== paciente.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
      }
    }

    return NextResponse.json({
      status: agendamento.status,
      medicoPresente: agendamento.medicoPresente,
      pacientePresente: agendamento.pacientePresente,
      salaId: agendamento.salaId,
      inicioReal: agendamento.inicioReal,
    });
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}
