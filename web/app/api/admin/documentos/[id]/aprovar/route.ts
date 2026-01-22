import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminInfo } from '@/lib/admin-auth';
import { DOCUMENTOS_POR_PERFIL } from '@/lib/onboarding';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getAdminInfo(request);
    if (!admin) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 });
    }

    const documento = await prisma.documento.findUnique({
      where: { id: params.id },
      include: { paciente: true },
    });

    if (!documento) {
      return NextResponse.json({ error: 'Documento nao encontrado' }, { status: 404 });
    }

    await prisma.documento.update({
      where: { id: params.id },
      data: {
        status: 'APROVADO',
        revisadoPorId: admin.id,
        revisadoEm: new Date(),
        atualizadoEm: new Date(),
      },
    });

    await prisma.auditoriaDocumento.create({
      data: {
        documentoId: params.id,
        pacienteId: documento.pacienteId,
        adminId: admin.id,
        acao: 'APROVADO',
        detalhes: { statusAnterior: documento.status, statusNovo: 'APROVADO' },
      },
    });

    const pacienteId = documento.pacienteId;
    const paciente = documento.paciente;
    
    const todosDocumentos = await prisma.documento.findMany({
      where: { pacienteId },
    });

    const perfil = paciente.perfilOnboarding || 'INICIANTE';
    const docsRequeridos = DOCUMENTOS_POR_PERFIL[perfil as keyof typeof DOCUMENTOS_POR_PERFIL] || [];
    
    const docsAprovados = todosDocumentos.filter(d => 
      d.id === params.id ? true : d.status === 'APROVADO'
    ).map(d => d.tipo);

    const todosRequeridosAprovados = docsRequeridos.every(
      tipoRequerido => docsAprovados.includes(tipoRequerido)
    );

    const assinaturaAtiva = await prisma.assinatura.findFirst({
      where: {
        pacienteId,
        status: 'ATIVA',
      },
    });

    if (todosRequeridosAprovados && docsRequeridos.length > 0 && assinaturaAtiva) {
      await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          statusOnboarding: 'ASSOCIADO_ATIVO',
          onboardingCompleto: true,
        },
      });
    } else if (todosRequeridosAprovados && docsRequeridos.length > 0 && !assinaturaAtiva) {
      await prisma.paciente.update({
        where: { id: pacienteId },
        data: {
          statusOnboarding: 'EM_VALIDACAO',
          onboardingCompleto: false,
        },
      });
    }

    return NextResponse.json({ success: true, message: 'Documento aprovado' });
  } catch (error) {
    console.error('Erro ao aprovar documento:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
