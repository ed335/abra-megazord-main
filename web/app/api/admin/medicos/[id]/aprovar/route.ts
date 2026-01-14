import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

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

    const { id } = params;
    const { acao, motivo } = await request.json();

    if (!acao || !['aprovar', 'rejeitar'].includes(acao)) {
      return NextResponse.json(
        { error: 'Ação inválida. Use "aprovar" ou "rejeitar"' },
        { status: 400 }
      );
    }

    const medico = await prisma.prescritor.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!medico) {
      return NextResponse.json(
        { error: 'Médico não encontrado' },
        { status: 404 }
      );
    }

    if (acao === 'aprovar') {
      await prisma.prescritor.update({
        where: { id },
        data: {
          crmVerificado: true,
          dataVerificacao: new Date(),
        },
      });

      await registrarLog({
        usuarioId: decoded.sub,
        acao: 'APROVAR_MEDICO',
        recurso: 'PRESCRITOR',
        recursoId: id,
        detalhes: {
          medicoNome: medico.nome,
          medicoCRM: medico.crm,
          medicoEspecialidade: medico.especialidade,
        },
      });

      return NextResponse.json({
        success: true,
        message: `CRM do Dr(a). ${medico.nome} aprovado com sucesso`,
      });
    } else {
      await prisma.$transaction([
        prisma.prescritor.update({
          where: { id },
          data: {
            crmVerificado: false,
            dataVerificacao: null,
          },
        }),
        prisma.usuario.update({
          where: { id: medico.usuarioId },
          data: { ativo: false },
        }),
      ]);

      await registrarLog({
        usuarioId: decoded.sub,
        acao: 'REJEITAR_MEDICO',
        recurso: 'PRESCRITOR',
        recursoId: id,
        detalhes: {
          medicoNome: medico.nome,
          medicoCRM: medico.crm,
          motivo: motivo || 'CRM não verificado',
        },
      });

      return NextResponse.json({
        success: true,
        message: `CRM do Dr(a). ${medico.nome} rejeitado`,
      });
    }
  } catch (error) {
    console.error('Erro ao aprovar/rejeitar médico:', error);
    return NextResponse.json(
      { error: 'Erro ao processar aprovação' },
      { status: 500 }
    );
  }
}
