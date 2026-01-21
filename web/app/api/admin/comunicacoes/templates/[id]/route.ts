import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.templateMensagem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir template:', error);
    return NextResponse.json({ error: 'Erro ao excluir template' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { nome, descricao, categoria, conteudo } = body;

    const variaveisExtraidas = conteudo?.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];

    const template = await prisma.templateMensagem.update({
      where: { id },
      data: {
        nome,
        descricao,
        categoria,
        conteudo,
        variaveis: variaveisExtraidas,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 });
  }
}
