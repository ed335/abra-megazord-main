import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { gerarNumeroAssociado, gerarQRToken, calcularValidadeCarteirinha } from '@/lib/onboarding';

const JWT_SECRET = process.env.JWT_SECRET || 'abracanm-secret-key';

export const dynamic = 'force-dynamic';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paciente = await prisma.paciente.findFirst({
      where: { usuarioId: decoded.sub },
      include: {
        carteirinha: true,
      },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    if (paciente.statusOnboarding !== 'ASSOCIADO_ATIVO') {
      return NextResponse.json({ 
        error: 'Carteirinha disponível apenas para associados ativos',
        statusOnboarding: paciente.statusOnboarding,
      }, { status: 403 });
    }

    if (!paciente.carteirinha) {
      return NextResponse.json({ 
        error: 'Carteirinha não gerada ainda',
        message: 'A carteirinha será gerada automaticamente quando sua associação for ativada.',
      }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://abracanm.com';
    const qrUrl = `${appUrl}/verificar/${paciente.carteirinha.qrToken}`;

    return NextResponse.json({
      carteirinha: {
        id: paciente.carteirinha.id,
        numero: paciente.carteirinha.numero,
        nomeExibido: paciente.carteirinha.nomeExibido,
        perfilTipo: paciente.carteirinha.perfilTipo,
        dataEmissao: paciente.carteirinha.dataEmissao,
        dataValidade: paciente.carteirinha.dataValidade,
        ativo: paciente.carteirinha.ativo,
        qrUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar carteirinha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const paciente = await prisma.paciente.findFirst({
      where: { usuarioId: decoded.sub },
      include: {
        carteirinha: true,
      },
    });

    if (!paciente) {
      return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 });
    }

    if (paciente.statusOnboarding !== 'ASSOCIADO_ATIVO') {
      return NextResponse.json({ 
        error: 'Carteirinha disponível apenas para associados ativos',
      }, { status: 403 });
    }

    if (paciente.carteirinha) {
      return NextResponse.json({ 
        error: 'Carteirinha já existe',
        carteirinha: paciente.carteirinha,
      }, { status: 400 });
    }

    const numeroAssociado = paciente.numeroAssociado || gerarNumeroAssociado();
    const qrToken = gerarQRToken();
    const dataValidade = calcularValidadeCarteirinha();

    const carteirinha = await prisma.$transaction(async (tx) => {
      if (!paciente.numeroAssociado) {
        await tx.paciente.update({
          where: { id: paciente.id },
          data: { numeroAssociado },
        });
      }

      return tx.carteirinha.create({
        data: {
          pacienteId: paciente.id,
          numero: numeroAssociado,
          qrToken,
          nomeExibido: paciente.nome,
          perfilTipo: paciente.perfilOnboarding,
          dataValidade,
        },
      });
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://abracanm.com';
    const qrUrl = `${appUrl}/verificar/${carteirinha.qrToken}`;

    return NextResponse.json({
      success: true,
      carteirinha: {
        id: carteirinha.id,
        numero: carteirinha.numero,
        nomeExibido: carteirinha.nomeExibido,
        perfilTipo: carteirinha.perfilTipo,
        dataEmissao: carteirinha.dataEmissao,
        dataValidade: carteirinha.dataValidade,
        qrUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar carteirinha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
