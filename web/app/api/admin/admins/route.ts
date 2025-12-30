import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
import bcrypt from 'bcrypt';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const admins = await prisma.admin.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            ativo: true,
            criadoEm: true,
          }
        }
      },
      orderBy: { criadoEm: 'desc' }
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Erro ao buscar admins:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar administradores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, nome, permissoes } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.usuario.create({
        data: {
          email: email.toLowerCase(),
          password: passwordHash,
          role: 'ADMIN',
          ativo: true,
          emailVerificado: true,
        },
        select: { id: true, email: true, role: true }
      });

      const admin = await tx.admin.create({
        data: {
          usuarioId: user.id,
          permissoes: permissoes || ['*'],
          notas: nome ? `Admin ${nome} criado em ${new Date().toISOString()}` : null,
        }
      });

      return { user, admin };
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'CADASTRO_ADMIN',
      recurso: 'ADMIN',
      recursoId: result.admin.id,
      detalhes: { email: email.toLowerCase(), nome: nome || null },
    });

    return NextResponse.json({
      success: true,
      message: 'Administrador criado com sucesso',
      admin: result
    });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return NextResponse.json(
      { error: 'Erro ao criar administrador' },
      { status: 500 }
    );
  }
}
