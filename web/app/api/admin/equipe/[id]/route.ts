import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';
import { temPermissao } from '@/lib/permissions';
import type { CargoAdmin, PermissaoAdmin } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const membro = await prisma.admin.findUnique({
      where: { id: params.id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            paciente: {
              select: {
                nome: true,
                cpf: true,
              },
            },
          },
        },
      },
    });

    if (!membro) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    return NextResponse.json(membro);
  } catch (error) {
    console.error('Erro ao buscar membro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { nome, cargo, setor, notas, permissoesCustom, ativo } = body;

    const existingMembro = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!existingMembro) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    if (existingMembro.cargo === 'SUPER_ADMIN' && admin.cargo !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas Super Admins podem editar outros Super Admins' },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};
    
    if (nome !== undefined) updateData.nome = nome || null;
    if (setor !== undefined) updateData.setor = setor || null;
    if (notas !== undefined) updateData.notas = notas || null;
    if (permissoesCustom !== undefined) updateData.permissoesCustom = permissoesCustom;
    if (ativo !== undefined) updateData.ativo = ativo;
    
    if (cargo !== undefined && admin.cargo === 'SUPER_ADMIN') {
      updateData.cargo = cargo;
    }

    const membroAtualizado = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(membroAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar membro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const existingMembro = await prisma.admin.findUnique({
      where: { id: params.id },
    });

    if (!existingMembro) {
      return NextResponse.json({ error: 'Membro não encontrado' }, { status: 404 });
    }

    if (existingMembro.cargo === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Super Admins não podem ser removidos' },
        { status: 403 }
      );
    }

    if (existingMembro.id === admin.id) {
      return NextResponse.json(
        { error: 'Você não pode remover a si mesmo' },
        { status: 400 }
      );
    }

    await prisma.usuario.update({
      where: { id: existingMembro.usuarioId },
      data: { role: 'PACIENTE' },
    });

    await prisma.admin.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover membro:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
