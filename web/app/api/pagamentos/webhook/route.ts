import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SyncpayWebhookPayload, isPaymentCompleted, isPaymentFailed } from '@/lib/syncpay';
export const dynamic = 'force-dynamic';

async function enviarWhatsAppConfirmacao(
  whatsapp: string,
  nomePaciente: string,
  nomeMedico: string,
  dataHora: Date
) {
  const evolutionApiUrl = process.env.EVOLUTION_API_URL;
  const evolutionApiKey = process.env.EVOLUTION_API_KEY;
  const evolutionInstance = process.env.EVOLUTION_INSTANCE;

  if (!evolutionApiUrl || !evolutionApiKey || !evolutionInstance) {
    console.log('Evolution API não configurada, pulando envio de WhatsApp');
    return false;
  }

  try {
    const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    const horaFormatada = dataHora.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const mensagem = `Olá ${nomePaciente}! 🌿

Seu pagamento foi confirmado e sua consulta está agendada!

📅 *Data:* ${dataFormatada}
⏰ *Horário:* ${horaFormatada}
👨‍⚕️ *Médico:* ${nomeMedico}
✅ *Status:* Pagamento confirmado

Você receberá o link para a teleconsulta no dia da sua consulta.

Em caso de dúvidas, entre em contato conosco.

ABRACANM - Associação Brasileira de Cannabis Medicinal`;

    const whatsappFormatado = whatsapp.replace(/\D/g, '');

    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: `55${whatsappFormatado}`,
        text: mensagem,
      }),
    });

    if (response.ok) {
      console.log('WhatsApp de confirmação enviado com sucesso');
      return true;
    } else {
      console.error('Erro ao enviar WhatsApp:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

function verifyWebhookAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.SYNCPAY_WEBHOOK_SECRET || process.env.SYNCPAY_CLIENT_SECRET;
  
  if (!expectedSecret) {
    console.error('SYNCPAY_WEBHOOK_SECRET não configurado - rejeitando webhooks por segurança');
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return token === expectedSecret;
}

function calcularDuracaoPlano(tipoPlano: string): number {
  switch (tipoPlano) {
    case 'TRIMESTRAL':
      return 3;
    case 'SEMESTRAL':
      return 6;
    case 'ANUAL':
      return 12;
    case 'MENSAL':
    default:
      return 1;
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!verifyWebhookAuth(request)) {
      console.warn('Webhook rejeitado: autenticação inválida');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const event = request.headers.get('event');
    const payload: SyncpayWebhookPayload = await request.json();

    console.log('Webhook recebido:', { event, identifier: payload.data?.id, status: payload.data?.status });

    if (!payload.data?.id) {
      return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
    }

    const identifier = payload.data.id;
    const status = payload.data.status;

    const pagamento = await (prisma as any).pagamento.findUnique({
      where: { syncpayIdentifier: identifier },
      include: { 
        assinatura: {
          include: {
            plano: true
          }
        }, 
        paciente: true 
      }
    });

    if (!pagamento) {
      console.warn('Pagamento não encontrado para identifier:', identifier);
      return NextResponse.json({ received: true, message: 'Pagamento não encontrado' });
    }

    if (pagamento.status === 'PAGO' && isPaymentCompleted(status)) {
      console.log('Webhook duplicado ignorado - pagamento já processado:', pagamento.id);
      return NextResponse.json({ received: true, status: 'already_processed' });
    }

    if (isPaymentCompleted(status)) {
      await (prisma as any).pagamento.update({
        where: { id: pagamento.id },
        data: {
          status: 'PAGO',
          pagoEm: new Date(),
          webhookRecebido: true,
          webhookData: payload as object,
        }
      });

      // Se for pagamento de consulta, confirmar o agendamento
      if (pagamento.agendamentoId) {
        const agendamento = await (prisma as any).agendamento.findUnique({
          where: { id: pagamento.agendamentoId },
          include: {
            paciente: { select: { nome: true, whatsapp: true } },
            prescritor: { select: { nome: true } },
          }
        });

        if (agendamento && agendamento.status === 'PENDENTE_PAGAMENTO') {
          await (prisma as any).agendamento.update({
            where: { id: pagamento.agendamentoId },
            data: {
              status: 'AGENDADO',
              confirmadoEm: new Date(),
            }
          });

          console.log(`Agendamento ${pagamento.agendamentoId} confirmado após pagamento`);

          // Enviar WhatsApp de confirmação
          if (agendamento.paciente?.whatsapp) {
            const whatsappEnviado = await enviarWhatsAppConfirmacao(
              agendamento.paciente.whatsapp,
              agendamento.paciente.nome,
              agendamento.prescritor?.nome || 'Médico ABRACANM',
              agendamento.dataHora
            );

            if (whatsappEnviado) {
              await (prisma as any).agendamento.update({
                where: { id: pagamento.agendamentoId },
                data: { whatsappConfirmacaoEnviado: true },
              });
            }
          }
        }
      }

      if (pagamento.assinaturaId && pagamento.assinatura) {
        const tipoPlano = pagamento.assinatura.plano?.tipo || 'MENSAL';
        const meses = calcularDuracaoPlano(tipoPlano);
        
        const dataInicio = new Date();
        const dataFim = new Date();
        dataFim.setMonth(dataFim.getMonth() + meses);

        await (prisma as any).assinatura.update({
          where: { id: pagamento.assinaturaId },
          data: {
            status: 'ATIVA',
            dataInicio,
            dataFim,
            proximaCobranca: dataFim,
          }
        });

        console.log(`Assinatura ${pagamento.assinaturaId} ativada por ${meses} mês(es)`);
      }

      console.log('Pagamento confirmado:', pagamento.id);

    } else if (isPaymentFailed(status)) {
      if (pagamento.status !== 'FALHOU') {
        await (prisma as any).pagamento.update({
          where: { id: pagamento.id },
          data: {
            status: 'FALHOU',
            webhookRecebido: true,
            webhookData: payload as object,
          }
        });
        console.log('Pagamento falhou:', pagamento.id);
      }
    } else {
      await (prisma as any).pagamento.update({
        where: { id: pagamento.id },
        data: {
          webhookRecebido: true,
          webhookData: payload as object,
        }
      });
    }

    return NextResponse.json({ received: true, status: 'processed' });

  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'ABRACANM Webhooks' });
}
