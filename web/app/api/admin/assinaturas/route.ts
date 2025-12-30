import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [assinaturas, total, stats] = await Promise.all([
      (prisma as any).assinatura.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          paciente: {
            select: { nome: true, email: true, whatsapp: true }
          },
          plano: {
            select: { nome: true, tipo: true }
          }
        }
      }),
      (prisma as any).assinatura.count({ where }),
      Promise.all([
        (prisma as any).assinatura.count({ where: { status: 'ATIVA' } }),
        (prisma as any).assinatura.count({ where: { status: 'PENDENTE' } }),
        (prisma as any).assinatura.count({ where: { status: 'CANCELADA' } }),
        (prisma as any).assinatura.count({ where: { status: 'EXPIRADA' } }),
      ])
    ]);

    return NextResponse.json({
      assinaturas: assinaturas.map((a: any) => ({
        id: a.id,
        status: a.status,
        dataInicio: a.dataInicio?.toISOString(),
        dataFim: a.dataFim?.toISOString(),
        proximaCobranca: a.proximaCobranca?.toISOString(),
        criadoEm: a.criadoEm.toISOString(),
        paciente: a.paciente,
        plano: a.plano,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        ativas: stats[0],
        pendentes: stats[1],
        canceladas: stats[2],
        expiradas: stats[3],
      }
    });

  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json({ error: 'Erro ao buscar assinaturas' }, { status: 500 });
  }
}
