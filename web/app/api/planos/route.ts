import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const planos = await (prisma as any).plano.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });

    // If no plans exist, return default plan
    if (planos.length === 0) {
      return NextResponse.json({
        planos: [{
          id: 'default',
          nome: 'Essencial',
          descricao: 'Acesso completo à plataforma ABRACANM',
          tipo: 'MENSAL',
          valorMensalidade: 39.90,
          valorConsulta: 149.00,
          valorPrimeiraConsulta: 99.00,
          beneficios: [
            'Acesso à plataforma',
            'Conteúdo educativo',
            'Suporte via WhatsApp',
            'Acompanhamento personalizado',
          ],
          ativo: true,
        }]
      });
    }

    return NextResponse.json({
      planos: planos.map((p: any) => ({
        ...p,
        valorMensalidade: Number(p.valorMensalidade),
        valorConsulta: Number(p.valorConsulta),
        valorPrimeiraConsulta: Number(p.valorPrimeiraConsulta),
      }))
    });

  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}
