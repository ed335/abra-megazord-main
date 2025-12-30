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
    const JWT_SECRET = getJWTSecret();
    const decoded = jwt.verify(token, JWT_SECRET) as { sub?: string; id?: string; email: string };
    return { id: decoded.sub || decoded.id, email: decoded.email };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const paciente = await (prisma as any).paciente.findUnique({
      where: { usuarioId: decoded.id },
    });

    if (!paciente) {
      return NextResponse.json({ assinatura: null });
    }

    const assinatura = await (prisma as any).assinatura.findFirst({
      where: {
        pacienteId: paciente.id,
        status: 'ATIVA',
      },
      include: {
        plano: {
          select: {
            id: true,
            nome: true,
            valorMensalidade: true,
            valorConsulta: true,
            valorPrimeiraConsulta: true,
          },
        },
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });

    return NextResponse.json({ assinatura });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinatura' }, { status: 500 });
  }
}
