import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';
import { gerarCodigoUnico, getDashboardIndicacao, NIVEIS_INDICACAO } from '@/lib/referral';

export const dynamic = 'force-dynamic';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return secret;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJWTSecret()) as { sub: string };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { paciente: true },
    });

    if (!usuario?.paciente) {
      return NextResponse.json({ message: 'Paciente não encontrado' }, { status: 404 });
    }

    const dashboard = await getDashboardIndicacao(usuario.paciente.id);

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Erro ao buscar indicações:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJWTSecret()) as { sub: string };

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.sub },
      include: { paciente: true },
    });

    if (!usuario?.paciente) {
      return NextResponse.json({ message: 'Paciente não encontrado' }, { status: 404 });
    }

    if (usuario.paciente.codigoIndicacao) {
      return NextResponse.json({
        codigoIndicacao: usuario.paciente.codigoIndicacao,
        message: 'Código já existe',
      });
    }

    const codigoIndicacao = await gerarCodigoUnico(usuario.paciente.nome);

    await prisma.paciente.update({
      where: { id: usuario.paciente.id },
      data: { codigoIndicacao },
    });

    return NextResponse.json({
      codigoIndicacao,
      message: 'Código gerado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
