import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const especialidade = searchParams.get('especialidade');
    const precoMin = searchParams.get('precoMin');
    const precoMax = searchParams.get('precoMax');
    const busca = searchParams.get('busca');

    const where: any = {
      crmVerificado: true,
      marketplaceVisible: true,
      aceitaNovosPacientes: true,
      consultaValor: { not: null },
    };

    if (especialidade) {
      where.OR = [
        { especialidade: { contains: especialidade, mode: 'insensitive' } },
        { especialidades: { has: especialidade } },
      ];
    }

    if (precoMin) {
      where.consultaValor = { ...where.consultaValor, gte: parseFloat(precoMin) };
    }

    if (precoMax) {
      where.consultaValor = { ...where.consultaValor, lte: parseFloat(precoMax) };
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { especialidade: { contains: busca, mode: 'insensitive' } },
        { bio: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const medicos = await prisma.prescritor.findMany({
      where,
      select: {
        id: true,
        nome: true,
        especialidade: true,
        especialidades: true,
        crm: true,
        fotoUrl: true,
        bio: true,
        experiencia: true,
        consultaValor: true,
        duracaoConsulta: true,
        _count: {
          select: {
            agendamentos: {
              where: { status: 'CONCLUIDO' },
            },
          },
        },
      },
      orderBy: [
        { consultaValor: 'asc' },
        { nome: 'asc' },
      ],
    });

    const especialidadesDisponiveis = await prisma.prescritor.findMany({
      where: {
        crmVerificado: true,
        marketplaceVisible: true,
      },
      select: {
        especialidade: true,
        especialidades: true,
      },
    });

    const todasEspecialidades = new Set<string>();
    especialidadesDisponiveis.forEach(m => {
      todasEspecialidades.add(m.especialidade);
      m.especialidades.forEach(e => todasEspecialidades.add(e));
    });

    return NextResponse.json({
      medicos: medicos.map(m => ({
        ...m,
        consultaValor: m.consultaValor ? Number(m.consultaValor) : null,
        consultasRealizadas: m._count.agendamentos,
      })),
      especialidades: Array.from(todasEspecialidades).sort(),
    });
  } catch (error) {
    console.error('Erro ao buscar médicos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar médicos' },
      { status: 500 }
    );
  }
}
