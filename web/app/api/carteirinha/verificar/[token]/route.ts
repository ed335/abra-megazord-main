import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token || token.length < 10) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    const carteirinha = await prisma.carteirinha.findUnique({
      where: { qrToken: token },
      include: {
        paciente: {
          select: {
            nome: true,
            statusOnboarding: true,
          },
        },
      },
    });

    if (!carteirinha) {
      return NextResponse.json({ 
        valido: false,
        mensagem: 'Carteirinha não encontrada',
      }, { status: 404 });
    }

    const agora = new Date();
    const vencida = carteirinha.dataValidade < agora;
    const ativo = carteirinha.ativo && 
                  carteirinha.paciente.statusOnboarding === 'ASSOCIADO_ATIVO' &&
                  !vencida;

    const nomeParts = carteirinha.nomeExibido.split(' ');
    const nomeAbreviado = nomeParts.length > 1 
      ? `${nomeParts[0]} ${nomeParts[nomeParts.length - 1].charAt(0)}.`
      : nomeParts[0];

    return NextResponse.json({
      valido: true,
      status: ativo ? 'ATIVO' : 'INATIVO',
      nomeAbreviado,
      validade: carteirinha.dataValidade,
      numero: carteirinha.numero,
      mensagem: ativo 
        ? 'Associado ativo da ABRACANM' 
        : vencida 
          ? 'Carteirinha vencida' 
          : 'Associação inativa',
    });
  } catch (error) {
    console.error('Erro ao verificar carteirinha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
