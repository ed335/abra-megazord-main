import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
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
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            ativo: true,
            emailVerificado: true,
          }
        }
      }
    });

    if (!associado) {
      return NextResponse.json(
        { error: 'Associado não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(associado);
  } catch (error) {
    console.error('Erro ao buscar associado:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar associado' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const { nome, whatsapp, cpf, dataNascimento, cep, rua, numero, complemento, bairro, cidade, estado, patologiaCID, jaUsaCannabis } = body;

    const associado = await prisma.paciente.update({
      where: { id: params.id },
      data: {
        nome: nome || undefined,
        whatsapp: whatsapp || undefined,
        cpf: cpf || undefined,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        cep: cep || undefined,
        rua: rua || undefined,
        numero: numero || undefined,
        complemento: complemento || undefined,
        bairro: bairro || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        patologiaCID: patologiaCID || undefined,
        jaUsaCannabis: jaUsaCannabis !== undefined ? jaUsaCannabis : undefined,
      },
      include: {
        usuario: {
          select: {
            ativo: true,
            emailVerificado: true,
          }
        }
      }
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'EDICAO_ASSOCIADO',
      recurso: 'ASSOCIADO',
      recursoId: params.id,
      detalhes: { nome: body.nome || associado.nome, camposAlterados: Object.keys(body) },
    });

    return NextResponse.json(associado);
  } catch (error) {
    console.error('Erro ao atualizar associado:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar associado' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
      include: { usuario: true }
    });

    if (!associado) {
      return NextResponse.json(
        { error: 'Associado não encontrado' },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.paciente.delete({
        where: { id: params.id }
      });
      
      await tx.usuario.delete({
        where: { id: associado.usuarioId }
      });
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'EXCLUSAO_ASSOCIADO',
      recurso: 'ASSOCIADO',
      recursoId: params.id,
      detalhes: { nome: associado.nome, email: associado.email },
    });

    return NextResponse.json({ success: true, message: 'Associado excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir associado:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir associado' },
      { status: 500 }
    );
  }
}
