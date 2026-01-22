import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const tipo = searchParams.get('tipo');

    const where: any = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;

    const documentos = await prisma.documento.findMany({
      where,
      include: {
        paciente: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
            perfilOnboarding: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 100,
    });

    return NextResponse.json({ documentos });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
