import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';
import { criarLembreteDocumentoRejeitado } from '@/lib/lembretes';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { motivoRejeicao } = body;

    if (!motivoRejeicao || !motivoRejeicao.trim()) {
      return NextResponse.json({ error: 'Motivo da rejeicao e obrigatorio' }, { status: 400 });
    }

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 });
    }

    await prisma.documento.update({
      where: { id: params.id },
      data: {
        status: 'REJEITADO',
        motivoRejeicao: motivoRejeicao.trim(),
        atualizadoEm: new Date(),
      },
    });

    await prisma.auditoriaDocumento.create({
      data: {
        documentoId: params.id,
        pacienteId: documento.pacienteId,
        adminId: admin.id,
        acao: 'REJEITADO',
        detalhes: { 
          statusAnterior: documento.status, 
          statusNovo: 'REJEITADO',
          motivoRejeicao: motivoRejeicao.trim() 
        },
      },
    });

    await prisma.paciente.update({
      where: { id: documento.pacienteId },
      data: {
        statusOnboarding: 'DOCS_PENDENTES',
      },
    });

    await criarLembreteDocumentoRejeitado(
      documento.pacienteId,
      params.id,
      motivoRejeicao.trim()
    );

    return NextResponse.json({ success: true, message: 'Documento rejeitado' });
  } catch (error) {
    console.error('Erro ao rejeitar documento:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
