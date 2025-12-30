import { getPrismaClient } from '@/lib/admin-auth';

const prisma = getPrismaClient();

export type AcaoAuditoria = 
  | 'LOGIN'
  | 'LOGOUT'
  | 'IMPERSONATE_USER'
  | 'CADASTRO_ASSOCIADO'
  | 'EDICAO_ASSOCIADO'
  | 'EXCLUSAO_ASSOCIADO'
  | 'ATIVAR_ASSOCIADO'
  | 'DESATIVAR_ASSOCIADO'
  | 'VISUALIZAR_DOCUMENTOS'
  | 'CADASTRO_ADMIN'
  | 'EXCLUSAO_ADMIN'
  | 'EXPORTAR_DADOS'
  | 'ENVIO_WHATSAPP'
  | 'CRIAR'
  | 'ATUALIZAR'
  | 'EXCLUIR';

export type RecursoAuditoria = 
  | 'ASSOCIADO'
  | 'ADMIN'
  | 'USUARIO'
  | 'SISTEMA'
  | 'DOCUMENTOS'
  | 'WHATSAPP'
  | 'AGENDAMENTO';

export async function registrarLog(params: {
  usuarioId: string;
  acao: AcaoAuditoria;
  recurso: RecursoAuditoria;
  recursoId?: string;
  detalhes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.logAuditoria.create({
      data: {
        usuarioId: params.usuarioId,
        acao: params.acao,
        recurso: params.recurso,
        recursoId: params.recursoId || null,
        detalhes: params.detalhes ? JSON.parse(JSON.stringify(params.detalhes)) : undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error);
  }
}
