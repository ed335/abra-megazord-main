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

    const templates = await prisma.templateMensagem.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: 'desc' },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Erro ao buscar templates:', error);
    return NextResponse.json({ error: 'Erro ao buscar templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { nome, descricao, categoria, conteudo, variaveis } = body;

    if (!nome || !conteudo) {
      return NextResponse.json({ error: 'Nome e conteúdo são obrigatórios' }, { status: 400 });
    }

    const existente = await prisma.templateMensagem.findUnique({
      where: { nome },
    });

    if (existente) {
      return NextResponse.json({ error: 'Já existe um template com este nome' }, { status: 400 });
    }

    const variaveisExtraidas = conteudo.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [];

    const template = await prisma.templateMensagem.create({
      data: {
        nome,
        descricao: descricao || null,
        categoria: categoria || 'GERAL',
        conteudo,
        variaveis: variaveis || variaveisExtraidas,
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 });
  }
}
