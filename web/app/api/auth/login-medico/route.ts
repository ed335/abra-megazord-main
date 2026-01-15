import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        prescritor: true,
      },
    });

    if (!usuario || usuario.role !== 'PRESCRITOR' || !usuario.prescritor) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    const passwordValid = await bcrypt.compare(password, usuario.password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: usuario.id,
        prescritorId: usuario.prescritor.id,
        email: usuario.email,
        role: 'PRESCRITOR',
        nome: usuario.prescritor.nome,
        crm: usuario.prescritor.crm,
        crmVerificado: usuario.prescritor.crmVerificado,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({
      success: true,
      token,
      prescritor: {
        id: usuario.prescritor.id,
        nome: usuario.prescritor.nome,
        email: usuario.email,
        crm: usuario.prescritor.crm,
        especialidade: usuario.prescritor.especialidade,
        crmVerificado: usuario.prescritor.crmVerificado,
      },
    });
  } catch (error) {
    console.error('Erro no login do médico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
