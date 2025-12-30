import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const associado = await prisma.paciente.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nome: true,
        documentoIdentidadeUrl: true,
        documentosMedicosUrls: true,
      }
    });

    if (!associado) {
      return NextResponse.json(
        { error: 'Associado não encontrado' },
        { status: 404 }
      );
    }

    const documentos = [];
    
    if (associado.documentoIdentidadeUrl) {
      documentos.push({
        tipo: 'Documento de Identidade',
        url: associado.documentoIdentidadeUrl,
        nome: 'documento_identidade',
      });
    }

    if (associado.documentosMedicosUrls && Array.isArray(associado.documentosMedicosUrls)) {
      associado.documentosMedicosUrls.forEach((doc: string, index: number) => {
        documentos.push({
          tipo: `Documento Médico ${index + 1}`,
          url: doc,
          nome: `documento_medico_${index + 1}`,
        });
      });
    }

    return NextResponse.json({
      associado: {
        id: associado.id,
        nome: associado.nome,
      },
      documentos,
    });
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documentos' },
      { status: 500 }
    );
  }
}
