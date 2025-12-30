import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nome, descricao, tipo, valorMensalidade, valorConsulta, valorPrimeiraConsulta, beneficios, ativo, ordem } = body;

    const plano = await (prisma as any).plano.update({
      where: { id: params.id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(tipo !== undefined && { tipo }),
        ...(valorMensalidade !== undefined && { valorMensalidade }),
        ...(valorConsulta !== undefined && { valorConsulta }),
        ...(valorPrimeiraConsulta !== undefined && { valorPrimeiraConsulta }),
        ...(beneficios !== undefined && { beneficios }),
        ...(ativo !== undefined && { ativo }),
        ...(ordem !== undefined && { ordem }),
      }
    });

    return NextResponse.json({ 
      success: true, 
      plano: {
        id: plano.id,
        nome: plano.nome,
        ativo: plano.ativo,
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar plano:', error);
    return NextResponse.json({ error: 'Erro ao atualizar plano' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const assinaturas = await (prisma as any).assinatura.count({
      where: { planoId: params.id }
    });

    if (assinaturas > 0) {
      return NextResponse.json({ 
        error: `Este plano possui ${assinaturas} assinatura(s) vinculada(s). Desative-o em vez de excluir.` 
      }, { status: 400 });
    }

    await (prisma as any).plano.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    return NextResponse.json({ error: 'Erro ao excluir plano' }, { status: 500 });
  }
}
