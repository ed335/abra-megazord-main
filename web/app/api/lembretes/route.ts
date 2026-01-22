import { NextRequest, NextResponse } from 'next/server';
import { obterLembretesUsuario } from '@/lib/lembretes';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const pacienteId = await getAuthenticatedUserId(request);
    if (!pacienteId) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const lembretes = await obterLembretesUsuario(pacienteId);

    return NextResponse.json({ lembretes });
  } catch (error) {
    console.error('Erro ao obter lembretes:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
