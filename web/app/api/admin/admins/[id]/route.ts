import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
      include: { usuario: true }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Administrador não encontrado' },
        { status: 404 }
      );
    }

    if (admin.usuarioId === decoded.sub) {
      return NextResponse.json(
        { error: 'Você não pode remover a si mesmo' },
        { status: 400 }
      );
    }

    const adminCount = await prisma.admin.count();
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: 'Não é possível remover o último administrador' },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.admin.delete({
        where: { id: params.id }
      });
      
      await tx.usuario.delete({
        where: { id: admin.usuarioId }
      });
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'EXCLUSAO_ADMIN',
      recurso: 'ADMIN',
      recursoId: params.id,
      detalhes: { email: admin.usuario.email },
    });

    return NextResponse.json({
      success: true,
      message: 'Administrador removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover admin:', error);
    return NextResponse.json(
      { error: 'Erro ao remover administrador' },
      { status: 500 }
    );
  }
}
