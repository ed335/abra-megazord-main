import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nome } = body;

    if (!email || !password || !nome) {
      return NextResponse.json(
        { message: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailLower = email.toLowerCase();

    const result = await prisma.$transaction(async (tx) => {
      const adminCount = await tx.usuario.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount > 0) {
        throw new Error('ADMIN_EXISTS');
      }

      const existingUser = await tx.usuario.findUnique({
        where: { email: emailLower },
      });

      if (existingUser) {
        throw new Error('EMAIL_EXISTS');
      }

      const user = await tx.usuario.create({
        data: {
          email: emailLower,
          password: passwordHash,
          role: 'ADMIN',
          ativo: true,
          emailVerificado: true,
        },
        select: { id: true, email: true, role: true },
      });

      await tx.admin.create({
        data: {
          usuarioId: user.id,
          permissoes: ['*'],
          notas: `Primeiro admin criado em ${new Date().toISOString()}`,
        },
      });

      return user;
    });

    return NextResponse.json({
      user: result,
      message: 'Administrador criado com sucesso',
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);

    if (error.message === 'ADMIN_EXISTS') {
      return NextResponse.json(
        { message: 'Já existe um administrador no sistema' },
        { status: 403 }
      );
    }

    if (error.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { message: 'E-mail já registrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: 'Erro ao criar administrador' },
      { status: 500 }
    );
  }
}
