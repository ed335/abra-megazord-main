import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';
import { temPermissao } from '@/lib/permissions';
import type { CargoAdmin, PermissaoAdmin } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const hasPermission = temPermissao(
      admin.cargo as CargoAdmin,
      admin.permissoesCustom as PermissaoAdmin[],
      'VER_EQUIPE'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const membros = await prisma.admin.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return NextResponse.json(membros);
  } catch (error) {
    console.error('Erro ao listar equipe:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const hasPermission = temPermissao(
      admin.cargo as CargoAdmin,
      admin.permissoesCustom as PermissaoAdmin[],
      'GERENCIAR_EQUIPE'
    );

    if (!hasPermission) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
    }

    const body = await request.json();
    const { email, nome, cargo, setor, notas, permissoesCustom } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado com este email' }, { status: 404 });
    }

    const existingAdmin = await prisma.admin.findUnique({
      where: { usuarioId: usuario.id },
    });

    if (existingAdmin) {
      return NextResponse.json({ error: 'Este usuário já é um administrador' }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { role: 'ADMIN' },
    });

    const novoAdmin = await prisma.admin.create({
      data: {
        usuarioId: usuario.id,
        nome: nome || null,
        cargo: cargo || 'ATENDENTE',
        setor: setor || null,
        notas: notas || null,
        permissoesCustom: permissoesCustom || [],
        criadoPorId: admin.id,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
            cpf: true,
          },
        },
      },
    });

    return NextResponse.json(novoAdmin, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar membro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
