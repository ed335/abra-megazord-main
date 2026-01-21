import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const [mensagens, lotes] = await Promise.all([
      prisma.mensagemWhatsApp.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 100,
        select: {
          id: true,
          tipo: true,
          status: true,
          destinatarioNome: true,
          destinatarioWhatsapp: true,
          templateNome: true,
          criadoEm: true,
        },
      }),
      prisma.loteMensagemWhatsApp.findMany({
        orderBy: { criadoEm: 'desc' },
        take: 20,
        select: {
          id: true,
          templateNome: true,
          totalDestinatarios: true,
          enviadas: true,
          falhas: true,
          status: true,
          criadoEm: true,
        },
      }),
    ]);

    return NextResponse.json({ 
      mensagens: mensagens.map(m => ({
        ...m,
        criadoEm: m.criadoEm.toISOString(),
      })),
      lotes: lotes.map(l => ({
        ...l,
        criadoEm: l.criadoEm.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}
