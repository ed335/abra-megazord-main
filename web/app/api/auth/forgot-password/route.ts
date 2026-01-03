import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { sendEmail, getPasswordResetEmailHtml } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { paciente: true },
    });

    if (usuario) {
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://abracanm.com';
      const resetLink = `${baseUrl}/redefinir-senha?token=${resetToken}`;
      const nome = usuario.paciente?.nome || 'Usuário';

      const emailHtml = getPasswordResetEmailHtml(nome, resetLink);
      
      await sendEmail({
        to: usuario.email,
        subject: 'Redefinir Senha - ABRACANM',
        html: emailHtml,
      });
    }

    return NextResponse.json({
      message: 'Se o email existir, você receberá um link para redefinir sua senha.',
    });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
