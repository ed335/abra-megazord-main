import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
import bcrypt from 'bcrypt';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function POST(
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

    const body = await request.json();
    const { novaSenha } = body;

    if (!novaSenha || novaSenha.length < 8) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    const associado = await prisma.paciente.findUnique({
      where: { id: params.id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

    if (!associado) {
      return NextResponse.json(
        { error: 'Associado não encontrado' },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10);

    await prisma.usuario.update({
      where: { id: associado.usuarioId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'RESET_SENHA_ADMIN',
      recurso: 'USUARIO',
      recursoId: associado.usuarioId,
      detalhes: { 
        associadoId: params.id,
        associadoNome: associado.nome,
        associadoEmail: associado.email,
        executadoPor: decoded.email || decoded.sub,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Senha do associado ${associado.nome} foi redefinida com sucesso.` 
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
