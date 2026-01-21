import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const HOURLY_MESSAGE_LIMIT = 100;

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const count = await prisma.mensagemWhatsApp.count({
      where: {
        criadoEm: { gte: oneHourAgo },
      },
    });

    const nextReset = new Date(oneHourAgo.getTime() + 60 * 60 * 1000);
    const resetIn = Math.max(0, Math.ceil((nextReset.getTime() - Date.now()) / 60000));

    return NextResponse.json({
      sent: count,
      limit: HOURLY_MESSAGE_LIMIT,
      resetIn,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ sent: 0, limit: HOURLY_MESSAGE_LIMIT, resetIn: 60 });
  }
}
