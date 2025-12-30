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

    const pagamento = await prisma.pagamento.findUnique({
      where: { id: params.id },
      include: { paciente: true },
    });

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: decoded.sub },
    });

    if (!paciente || paciente.id !== pagamento.pacienteId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    return NextResponse.json({
      id: pagamento.id,
      status: pagamento.status,
      valor: pagamento.valor,
      tipo: pagamento.tipo,
      criadoEm: pagamento.criadoEm,
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status do pagamento' },
      { status: 500 }
    );
  }
}
