import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getJWTSecret } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { nome, email, whatsapp, senha, password, consenteLGPD } = body;

    const senhaFinal = senha || password;
    
    if (!nome || !email || !whatsapp || !senhaFinal) {
      return NextResponse.json(
        { message: 'Dados obrigatórios não informados (nome, email, whatsapp, senha)' },
        { status: 400 }
      );
    }

    if (senhaFinal.length < 8) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Este e-mail já está cadastrado. Tente fazer login.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(senhaFinal, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        role: 'PACIENTE',
        paciente: {
          create: {
            nome,
            email,
            whatsapp: whatsapp.replace(/\D/g, ''),
            consenteLGPD: consenteLGPD || false,
            consentimentoEm: consenteLGPD ? new Date() : null,
          },
        },
      },
      include: {
        paciente: true,
      },
    });

    const token = jwt.sign(
      { 
        sub: usuario.id, 
        email: usuario.email, 
        role: usuario.role 
      },
      getJWTSecret(),
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Cadastro realizado com sucesso',
      user: {
        id: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nome: usuario.paciente?.nome,
        onboardingCompleto: false,
      },
      access_token: token,
    });
  } catch (error) {
    console.error('Register quick error:', error);
    return NextResponse.json(
      { message: 'Erro ao processar cadastro' },
      { status: 500 }
    );
  }
}
