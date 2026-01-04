import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigo = searchParams.get('codigo');

    if (!codigo) {
      return NextResponse.json({ valid: false, message: 'Código não informado' });
    }

    const indicador = await prisma.paciente.findUnique({
      where: { codigoIndicacao: codigo.toUpperCase() },
      select: {
        id: true,
        nome: true,
      },
    });

    if (!indicador) {
      return NextResponse.json({ valid: false, message: 'Código inválido' });
    }

    const primeiroNome = indicador.nome.split(' ')[0];

    return NextResponse.json({
      valid: true,
      indicadorNome: primeiroNome,
      message: `Indicado por ${primeiroNome}`,
    });
  } catch (error) {
    console.error('Erro ao validar código:', error);
    return NextResponse.json({ valid: false, message: 'Erro ao validar' });
  }
}
