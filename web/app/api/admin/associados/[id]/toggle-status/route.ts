import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
import { sendRegistrationApproval } from '@/lib/evolution';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://abracanm.org.br';

export async function POST(
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

    const novoStatus = !associado.usuario.ativo;

    await prisma.usuario.update({
      where: { id: associado.usuarioId },
      data: { ativo: novoStatus }
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: novoStatus ? 'ATIVAR_ASSOCIADO' : 'DESATIVAR_ASSOCIADO',
      recurso: 'ASSOCIADO',
      recursoId: params.id,
      detalhes: { nome: associado.nome, statusAnterior: !novoStatus, novoStatus },
    });

    if (novoStatus && associado.telefone) {
      const preAnamneseLink = `${BASE_URL}/pre-anamnese`;
      await sendRegistrationApproval(
        associado.telefone,
        associado.nome,
        preAnamneseLink
      ).catch(err => console.error('Erro ao enviar WhatsApp de validação:', err));
    }

    return NextResponse.json({ 
      success: true, 
      ativo: novoStatus,
      message: novoStatus ? 'Associado ativado com sucesso' : 'Associado desativado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    return NextResponse.json(
      { error: 'Erro ao alterar status do associado' },
      { status: 500 }
    );
  }
}
