import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const adminCount = await prisma.usuario.count({
      where: { role: 'ADMIN' },
    });

    return NextResponse.json({ exists: adminCount > 0, count: adminCount });
  } catch (error) {
    console.error('Error checking admin:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar administrador', exists: null },
      { status: 500 }
    );
  }
}
