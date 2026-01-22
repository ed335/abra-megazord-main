import { prisma } from './prisma';
import { sendWhatsAppMessageWithDelay } from './evolution';

export type TipoLembrete = 
  | 'PRESCRICAO_VENCENDO'
  | 'ANVISA_VENCENDO'
  | 'CONTRIBUICAO_VENCENDO'
  | 'DOCUMENTO_PENDENTE'
  | 'DOCUMENTO_REJEITADO';

const DIAS_ANTECEDENCIA_PRESCRICAO = 30;
const DIAS_ANTECEDENCIA_ANVISA = 60;
const DIAS_ANTECEDENCIA_CONTRIBUICAO = 7;

export async function gerarLembretesVencimentos(): Promise<number> {
  const hoje = new Date();
  let lembretesGerados = 0;

  const prescricoesVencendo = await prisma.documento.findMany({
    where: {
      tipo: 'PRESCRICAO',
      status: 'APROVADO',
      dataValidade: {
        gte: hoje,
        lte: new Date(hoje.getTime() + DIAS_ANTECEDENCIA_PRESCRICAO * 24 * 60 * 60 * 1000),
      },
    },
    include: { paciente: true },
  });

  for (const doc of prescricoesVencendo) {
    const lembreteExistente = await prisma.lembrete.findFirst({
      where: {
        pacienteId: doc.pacienteId,
        tipo: 'PRESCRICAO_VENCENDO',
        referencia: doc.id,
        enviado: false,
      },
    });

    if (!lembreteExistente && doc.dataValidade) {
      const diasRestantes = Math.ceil(
        (doc.dataValidade.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)
      );

      await prisma.lembrete.create({
        data: {
          pacienteId: doc.pacienteId,
          tipo: 'PRESCRICAO_VENCENDO',
          referencia: doc.id,
          dataLembrete: new Date(),
          mensagem: `Sua prescrição médica vence em ${diasRestantes} dias. Agende uma nova consulta para renovar.`,
        },
      });
      lembretesGerados++;
    }
  }

  const anvisasVencendo = await prisma.documento.findMany({
    where: {
      tipo: 'AUTORIZACAO_ANVISA',
      status: 'APROVADO',
      dataValidade: {
        gte: hoje,
        lte: new Date(hoje.getTime() + DIAS_ANTECEDENCIA_ANVISA * 24 * 60 * 60 * 1000),
      },
    },
    include: { paciente: true },
  });

  for (const doc of anvisasVencendo) {
    const lembreteExistente = await prisma.lembrete.findFirst({
      where: {
        pacienteId: doc.pacienteId,
        tipo: 'ANVISA_VENCENDO',
        referencia: doc.id,
        enviado: false,
      },
    });

    if (!lembreteExistente && doc.dataValidade) {
      const diasRestantes = Math.ceil(
        (doc.dataValidade.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)
      );

      await prisma.lembrete.create({
        data: {
          pacienteId: doc.pacienteId,
          tipo: 'ANVISA_VENCENDO',
          referencia: doc.id,
          dataLembrete: new Date(),
          mensagem: `Sua autorização ANVISA vence em ${diasRestantes} dias. Inicie o processo de renovação.`,
        },
      });
      lembretesGerados++;
    }
  }

  const assinaturasVencendo = await prisma.assinatura.findMany({
    where: {
      status: 'ATIVA',
      dataFim: {
        gte: hoje,
        lte: new Date(hoje.getTime() + DIAS_ANTECEDENCIA_CONTRIBUICAO * 24 * 60 * 60 * 1000),
      },
    },
    include: { paciente: true },
  });

  for (const assinatura of assinaturasVencendo) {
    const lembreteExistente = await prisma.lembrete.findFirst({
      where: {
        pacienteId: assinatura.pacienteId,
        tipo: 'CONTRIBUICAO_VENCENDO',
        referencia: assinatura.id,
        enviado: false,
      },
    });

    if (!lembreteExistente && assinatura.dataFim) {
      const diasRestantes = Math.ceil(
        (assinatura.dataFim.getTime() - hoje.getTime()) / (24 * 60 * 60 * 1000)
      );

      await prisma.lembrete.create({
        data: {
          pacienteId: assinatura.pacienteId,
          tipo: 'CONTRIBUICAO_VENCENDO',
          referencia: assinatura.id,
          dataLembrete: new Date(),
          mensagem: `Sua contribuição vence em ${diasRestantes} dias. Renove para manter seus benefícios.`,
        },
      });
      lembretesGerados++;
    }
  }

  return lembretesGerados;
}

const MAX_TENTATIVAS_ENVIO = 3;

export async function processarLembretesPendentes(): Promise<{ enviados: number; erros: number; ignorados: number }> {
  const umDiaAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const lembretesPendentes = await prisma.lembrete.findMany({
    where: {
      enviado: false,
      dataLembrete: { lte: new Date() },
      criadoEm: { gte: umDiaAtras },
    },
    take: 50,
    orderBy: { criadoEm: 'asc' },
  });

  let enviados = 0;
  let erros = 0;
  let ignorados = 0;

  for (const lembrete of lembretesPendentes) {
    const tentativasAnteriores = await prisma.lembrete.count({
      where: {
        pacienteId: lembrete.pacienteId,
        tipo: lembrete.tipo,
        referencia: lembrete.referencia,
        enviadoEm: { gte: umDiaAtras },
        enviado: true,
      },
    });

    if (tentativasAnteriores >= MAX_TENTATIVAS_ENVIO) {
      ignorados++;
      continue;
    }

    const paciente = await prisma.paciente.findUnique({
      where: { id: lembrete.pacienteId },
    });

    if (!paciente?.telefone) {
      erros++;
      continue;
    }

    const mensagemCompleta = formatarMensagemLembrete(
      lembrete.tipo as TipoLembrete,
      paciente.nome,
      lembrete.mensagem
    );

    const sucesso = await sendWhatsAppMessageWithDelay({
      phone: paciente.telefone,
      message: mensagemCompleta,
    });

    if (sucesso) {
      await prisma.lembrete.update({
        where: { id: lembrete.id },
        data: {
          enviado: true,
          enviadoEm: new Date(),
          canalEnvio: 'WHATSAPP',
        },
      });
      enviados++;
    } else {
      erros++;
    }
  }

  return { enviados, erros, ignorados };
}

function formatarMensagemLembrete(
  tipo: TipoLembrete,
  nomeUsuario: string,
  mensagemBase: string
): string {
  const emojis: Record<TipoLembrete, string> = {
    PRESCRICAO_VENCENDO: '📋',
    ANVISA_VENCENDO: '🏥',
    CONTRIBUICAO_VENCENDO: '💳',
    DOCUMENTO_PENDENTE: '📄',
    DOCUMENTO_REJEITADO: '❌',
  };

  const titulos: Record<TipoLembrete, string> = {
    PRESCRICAO_VENCENDO: 'Prescrição Vencendo',
    ANVISA_VENCENDO: 'Autorização ANVISA Vencendo',
    CONTRIBUICAO_VENCENDO: 'Contribuição Vencendo',
    DOCUMENTO_PENDENTE: 'Documento Pendente',
    DOCUMENTO_REJEITADO: 'Documento Rejeitado',
  };

  return `${emojis[tipo]} *ABRACANM - ${titulos[tipo]}*

Olá, ${nomeUsuario}!

${mensagemBase}

Acesse sua área de associado para mais informações.

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;
}

export async function criarLembreteDocumentoRejeitado(
  pacienteId: string,
  documentoId: string,
  motivo: string
): Promise<void> {
  await prisma.lembrete.create({
    data: {
      pacienteId,
      tipo: 'DOCUMENTO_REJEITADO',
      referencia: documentoId,
      dataLembrete: new Date(),
      mensagem: `Um documento foi rejeitado. Motivo: ${motivo}. Por favor, envie um novo documento.`,
    },
  });
}

export async function criarLembreteDocumentoPendente(
  pacienteId: string,
  tipoDocumento: string
): Promise<void> {
  const lembreteExistente = await prisma.lembrete.findFirst({
    where: {
      pacienteId,
      tipo: 'DOCUMENTO_PENDENTE',
      referencia: tipoDocumento,
      enviado: false,
    },
  });

  if (!lembreteExistente) {
    await prisma.lembrete.create({
      data: {
        pacienteId,
        tipo: 'DOCUMENTO_PENDENTE',
        referencia: tipoDocumento,
        dataLembrete: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mensagem: `Você ainda não enviou o documento: ${tipoDocumento}. Complete seu cadastro para acessar todos os benefícios.`,
      },
    });
  }
}

export async function obterLembretesUsuario(pacienteId: string) {
  return prisma.lembrete.findMany({
    where: { pacienteId },
    orderBy: { criadoEm: 'desc' },
    take: 20,
  });
}
