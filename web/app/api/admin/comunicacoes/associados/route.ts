import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const pacientes = await prisma.paciente.findMany({
      where: {
        whatsapp: { not: '' },
      },
      select: {
        id: true,
        nome: true,
        whatsapp: true,
        email: true,
        criadoEm: true,
        preAnamnese: {
          select: { id: true },
        },
        assinaturas: {
          where: { status: 'ATIVA' },
          include: {
            plano: {
              select: { nome: true },
            },
          },
          take: 1,
        },
      },
      orderBy: { nome: 'asc' },
    });

    const associados = pacientes.map(p => ({
      id: p.id,
      nome: p.nome,
      whatsapp: p.whatsapp || '',
      email: p.email || '',
      status: 'APROVADO',
      planoNome: p.assinaturas[0]?.plano?.nome || null,
      preAnamnese: !!p.preAnamnese,
      criadoEm: p.criadoEm.toISOString(),
    }));

    return NextResponse.json({ associados });
  } catch (error) {
    console.error('Erro ao buscar associados:', error);
    return NextResponse.json({ error: 'Erro ao buscar associados' }, { status: 500 });
  }
}
