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

async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string; role: string };
    
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    
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
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const agendamento = await (prisma as any).agendamento.findUnique({
      where: { id: params.id },
    });

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    await (prisma as any).agendamento.update({
      where: { id: params.id },
      data: {
        status: 'CONCLUIDO',
        medicoPresente: false,
        pacientePresente: false,
        fimReal: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao encerrar consulta:', error);
    return NextResponse.json({ error: 'Erro ao encerrar consulta' }, { status: 500 });
  }
}
