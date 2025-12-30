import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { paciente: true, prescritor: true },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const impersonateToken = jwt.sign(
      { 
        sub: usuario.id, 
        email: usuario.email, 
        role: usuario.role,
        impersonatedBy: decoded.sub,
        isImpersonation: true
      },
      getJWTSecret(),
      { expiresIn: '1h' }
    );

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'IMPERSONATE_USER',
      recurso: 'USUARIO',
      recursoId: userId,
      detalhes: { 
        usuarioEmail: usuario.email,
        usuarioNome: usuario.paciente?.nome || usuario.prescritor?.nome || 'N/A'
      },
    });

    let nome = '';
    if (usuario.paciente) nome = usuario.paciente.nome;
    else if (usuario.prescritor) nome = usuario.prescritor.nome;

    return NextResponse.json({
      success: true,
      access_token: impersonateToken,
      user: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nome,
      },
      message: `Logado como ${nome || usuario.email}`
    });
  } catch (error) {
    console.error('Erro ao impersonar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer login como usuário' },
      { status: 500 }
    );
  }
}
