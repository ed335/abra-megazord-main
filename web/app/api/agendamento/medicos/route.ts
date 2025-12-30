import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const medicos = await prisma.prescritor.findMany({
      where: {
        crmVerificado: true,
        aceitaNovosPacientes: true,
        usuario: {
          ativo: true,
        },
      },
      select: {
        id: true,
        nome: true,
        especialidade: true,
        crm: true,
        fotoUrl: true,
        duracaoConsulta: true,
        disponibilidades: {
          where: { ativo: true },
          select: {
            diaSemana: true,
            horaInicio: true,
            horaFim: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json({ medicos });
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médicos disponíveis' },
      { status: 500 }
    );
  }
}
