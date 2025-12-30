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

    const planos = await (prisma as any).plano.findMany({
      orderBy: { ordem: 'asc' },
      include: {
        _count: {
          select: { assinaturas: true }
        }
      }
    });

    return NextResponse.json({
      planos: planos.map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        tipo: p.tipo,
        valorMensalidade: Number(p.valorMensalidade),
        valorConsulta: Number(p.valorConsulta),
        valorPrimeiraConsulta: Number(p.valorPrimeiraConsulta),
        beneficios: p.beneficios,
        ativo: p.ativo,
        ordem: p.ordem,
        totalAssinaturas: p._count.assinaturas,
        criadoEm: p.criadoEm.toISOString(),
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, descricao, tipo, valorMensalidade, valorConsulta, valorPrimeiraConsulta, beneficios, ordem } = body;

    if (!nome || !tipo || valorMensalidade === undefined) {
      return NextResponse.json({ error: 'Dados obrigatórios não informados' }, { status: 400 });
    }

    const plano = await (prisma as any).plano.create({
      data: {
        nome,
        descricao: descricao || null,
        tipo,
        valorMensalidade,
        valorConsulta: valorConsulta || 149.00,
        valorPrimeiraConsulta: valorPrimeiraConsulta || 99.00,
        beneficios: beneficios || [],
        ordem: ordem || 0,
        ativo: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      plano: {
        id: plano.id,
        nome: plano.nome,
      }
    });

  } catch (error) {
    console.error('Erro ao criar plano:', error);
    return NextResponse.json({ error: 'Erro ao criar plano' }, { status: 500 });
  }
}
