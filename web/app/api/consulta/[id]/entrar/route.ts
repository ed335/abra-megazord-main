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
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paciente = await (prisma as any).paciente.findUnique({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    const agendamento = await (prisma as any).agendamento.findUnique({
      where: { id: params.id },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    if (agendamento.pacienteId !== paciente.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
    }

    if (!agendamento.medicoPresente) {
      return NextResponse.json({ 
        error: 'Aguardando médico',
        aguardando: true 
      }, { status: 200 });
    }

    await (prisma as any).agendamento.update({
      where: { id: params.id },
      data: { pacientePresente: true },
    });

    return NextResponse.json({
      success: true,
      salaId: agendamento.salaId,
      medicoPresente: agendamento.medicoPresente,
    });
  } catch (error) {
    console.error('Erro ao entrar na consulta:', error);
    return NextResponse.json({ error: 'Erro ao entrar na consulta' }, { status: 500 });
  }
}
