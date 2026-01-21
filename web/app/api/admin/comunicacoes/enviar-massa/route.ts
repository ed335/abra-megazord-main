import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { sendBulkWhatsAppMessages } from '@/lib/evolution';

export const dynamic = 'force-dynamic';

const HOURLY_MESSAGE_LIMIT = 100;

function replaceVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  }
  return result;
}

async function getDbMessageStats(): Promise<{ sent: number; limit: number; resetIn: number }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const count = await prisma.mensagemWhatsApp.count({
    where: {
      criadoEm: { gte: oneHourAgo },
    },
  });

  const nextReset = new Date(oneHourAgo.getTime() + 60 * 60 * 1000);
  const resetIn = Math.max(0, Math.ceil((nextReset.getTime() - Date.now()) / 60000));

  return {
    sent: count,
    limit: HOURLY_MESSAGE_LIMIT,
    resetIn,
  };
}

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const adminId = decoded.sub;
    const body = await request.json();
    const { destinatarios, mensagem, templateId, filtrosUsados } = body;

    if (!destinatarios || destinatarios.length === 0) {
      return NextResponse.json({ error: 'Nenhum destinatário selecionado' }, { status: 400 });
    }

    if (!mensagem) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    const stats = await getDbMessageStats();
    const remaining = stats.limit - stats.sent;
    
    if (remaining <= 0) {
      return NextResponse.json({ 
        error: 'Limite de mensagens por hora atingido. Tente novamente mais tarde.',
        resetIn: stats.resetIn,
      }, { status: 429 });
    }

    if (destinatarios.length > remaining) {
      return NextResponse.json({ 
        error: `Limite de envios: apenas ${remaining} mensagens restantes nesta hora.`,
        remaining,
        resetIn: stats.resetIn,
      }, { status: 429 });
    }

    const pacientes = await prisma.paciente.findMany({
      where: {
        id: { in: destinatarios },
        whatsapp: { not: '' },
      },
      select: {
        id: true,
        nome: true,
        whatsapp: true,
        email: true,
        assinaturas: {
          where: { status: 'ATIVA' },
          include: {
            plano: { select: { nome: true } },
          },
          take: 1,
        },
      },
    });

    if (pacientes.length === 0) {
      return NextResponse.json({ error: 'Nenhum paciente encontrado com WhatsApp' }, { status: 400 });
    }

    let templateNome = 'Mensagem personalizada';
    let templateConteudo = mensagem;

    if (templateId) {
      const template = await prisma.templateMensagem.findUnique({
        where: { id: templateId },
      });
      if (template) {
        templateNome = template.nome;
        templateConteudo = template.conteudo;
      }
    }

    const lote = await prisma.loteMensagemWhatsApp.create({
      data: {
        adminId,
        templateNome,
        templateTexto: templateConteudo,
        filtrosUsados: filtrosUsados || null,
        totalDestinatarios: pacientes.length,
        enviadas: 0,
        falhas: 0,
        status: 'EM_ANDAMENTO',
      },
    });

    const mensagensParaEnviar = pacientes.map(p => {
      const variables = {
        nome: p.nome,
        plano: p.assinaturas[0]?.plano?.nome || 'Sem plano',
        email: p.email || '',
        data: new Date().toLocaleDateString('pt-BR'),
      };
      
      return {
        phone: p.whatsapp!,
        message: replaceVariables(templateConteudo, variables),
        pacienteId: p.id,
        pacienteNome: p.nome,
      };
    });

    const results = await sendBulkWhatsAppMessages(
      mensagensParaEnviar.map(m => ({ phone: m.phone, message: m.message }))
    );

    let enviadas = 0;
    let falhas = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const pacienteInfo = mensagensParaEnviar[i];

      await prisma.mensagemWhatsApp.create({
        data: {
          adminId,
          tipo: 'MASSA',
          status: result.success ? 'ENVIADA' : 'FALHA',
          destinatarioId: pacienteInfo.pacienteId,
          destinatarioNome: pacienteInfo.pacienteNome,
          destinatarioWhatsapp: pacienteInfo.phone,
          templateNome: templateNome,
          mensagem: pacienteInfo.message,
          erro: result.error || null,
        },
      });

      if (result.success) {
        enviadas++;
      } else {
        falhas++;
      }
    }

    await prisma.loteMensagemWhatsApp.update({
      where: { id: lote.id },
      data: {
        enviadas,
        falhas,
        status: 'CONCLUIDO',
      },
    });

    return NextResponse.json({
      success: true,
      loteId: lote.id,
      total: pacientes.length,
      enviadas,
      falhas,
    });
  } catch (error) {
    console.error('Erro ao enviar mensagens em massa:', error);
    return NextResponse.json({ error: 'Erro ao enviar mensagens' }, { status: 500 });
  }
}
