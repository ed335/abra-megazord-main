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

    // Get all payments with pagination
    const pagamentos = await (prisma as any).pagamento.findMany({
      orderBy: { criadoEm: 'desc' },
      take: 100,
      include: {
        paciente: {
          select: { nome: true, email: true }
        }
      }
    });

    // Calculate stats
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [totalRecebido, totalPendente, assinaturasAtivas, pagamentosHoje] = await Promise.all([
      (prisma as any).pagamento.aggregate({
        _sum: { valor: true },
        where: { status: 'PAGO' }
      }),
      (prisma as any).pagamento.aggregate({
        _sum: { valor: true },
        where: { status: 'PENDENTE' }
      }),
      (prisma as any).assinatura.count({
        where: { status: 'ATIVA' }
      }),
      (prisma as any).pagamento.count({
        where: {
          status: 'PAGO',
          pagoEm: { gte: hoje }
        }
      })
    ]);

    return NextResponse.json({
      pagamentos: pagamentos.map((p: any) => ({
        id: p.id,
        tipo: p.tipo,
        valor: Number(p.valor),
        status: p.status,
        clienteNome: p.clienteNome || p.paciente?.nome,
        clienteEmail: p.clienteEmail || p.paciente?.email,
        pagoEm: p.pagoEm?.toISOString(),
        criadoEm: p.criadoEm.toISOString(),
      })),
      stats: {
        totalRecebido: Number(totalRecebido._sum.valor || 0),
        totalPendente: Number(totalPendente._sum.valor || 0),
        assinaturasAtivas,
        pagamentosHoje,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pagamentos' },
      { status: 500 }
    );
  }
}
