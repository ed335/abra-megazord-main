import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const tipo = searchParams.get('tipo') || '';

    const where: Record<string, unknown> = {};
    if (tipo) {
      where.tipo = tipo;
    }

    const [mensagens, total] = await Promise.all([
      prisma.mensagemWhatsApp.findMany({
        where,
        include: {
          admin: {
            include: {
              usuario: {
                select: { email: true },
              },
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mensagemWhatsApp.count({ where }),
    ]);

    const lotes = await prisma.loteMensagemWhatsApp.findMany({
      include: {
        admin: {
          include: {
            usuario: {
              select: { email: true },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      mensagens,
      lotes,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
