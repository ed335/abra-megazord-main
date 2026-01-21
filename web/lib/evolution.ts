const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

const MIN_DELAY_MS = 3000;
const MAX_DELAY_MS = 8000;
const BULK_MIN_DELAY_MS = 5000;
const BULK_MAX_DELAY_MS = 15000;
const MAX_MESSAGES_PER_HOUR = 100;

let messagesSentThisHour = 0;
let hourResetTime = Date.now() + 3600000;

interface SendMessageOptions {
  phone: string;
  message: string;
}

interface BulkMessageResult {
  phone: string;
  success: boolean;
  error?: string;
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkAndResetHourlyLimit(): boolean {
  if (Date.now() > hourResetTime) {
    messagesSentThisHour = 0;
    hourResetTime = Date.now() + 3600000;
  }
  return messagesSentThisHour < MAX_MESSAGES_PER_HOUR;
}

function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

export async function sendWhatsAppMessage({ phone, message }: SendMessageOptions): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.warn('Evolution API não configurada');
    return false;
  }

  if (!checkAndResetHourlyLimit()) {
    console.warn('Limite de mensagens por hora atingido');
    return false;
  }

  try {
    const phoneNumber = phone.replace(/\D/g, '');
    const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: formattedPhone,
          text: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Erro Evolution API:', error);
      return false;
    }

    messagesSentThisHour++;
    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

export async function sendWhatsAppMessageWithDelay({ phone, message }: SendMessageOptions): Promise<boolean> {
  const delay = randomDelay(MIN_DELAY_MS, MAX_DELAY_MS);
  await sleep(delay);
  return sendWhatsAppMessage({ phone, message });
}

export async function sendBulkWhatsAppMessages(
  messages: SendMessageOptions[],
  onProgress?: (current: number, total: number, result: BulkMessageResult) => void
): Promise<BulkMessageResult[]> {
  const results: BulkMessageResult[] = [];
  
  for (let i = 0; i < messages.length; i++) {
    const { phone, message } = messages[i];
    
    if (!checkAndResetHourlyLimit()) {
      console.warn(`Limite atingido. Pausando envio em ${i}/${messages.length}`);
      results.push({ phone, success: false, error: 'Limite de mensagens por hora atingido' });
      continue;
    }

    try {
      const success = await sendWhatsAppMessage({ phone, message });
      const result = { phone, success, error: success ? undefined : 'Falha no envio' };
      results.push(result);
      
      if (onProgress) {
        onProgress(i + 1, messages.length, result);
      }

      if (i < messages.length - 1) {
        const delay = randomDelay(BULK_MIN_DELAY_MS, BULK_MAX_DELAY_MS);
        console.log(`Aguardando ${delay}ms antes do próximo envio...`);
        await sleep(delay);
      }
    } catch (error) {
      results.push({ phone, success: false, error: String(error) });
    }
  }

  return results;
}

export async function sendTemplateMessage(
  phone: string,
  template: string,
  variables: Record<string, string>
): Promise<boolean> {
  const message = replaceTemplateVariables(template, variables);
  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendBulkTemplateMessages(
  recipients: Array<{ phone: string; variables: Record<string, string> }>,
  template: string,
  onProgress?: (current: number, total: number, result: BulkMessageResult) => void
): Promise<BulkMessageResult[]> {
  const messages = recipients.map(r => ({
    phone: r.phone,
    message: replaceTemplateVariables(template, r.variables),
  }));
  
  return sendBulkWhatsAppMessages(messages, onProgress);
}

export function getMessageStats(): { sent: number; limit: number; resetIn: number } {
  return {
    sent: messagesSentThisHour,
    limit: MAX_MESSAGES_PER_HOUR,
    resetIn: Math.max(0, hourResetTime - Date.now()),
  };
}

export async function sendAppointmentConfirmation(
  phone: string,
  patientName: string,
  doctorName: string,
  appointmentDate: Date
): Promise<boolean> {
  const dateStr = appointmentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  
  const timeStr = appointmentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `🌿 *ABRACANM - Consulta Agendada*

Olá, ${patientName}!

Sua consulta foi agendada com sucesso:

📅 *Data:* ${dateStr}
🕐 *Horário:* ${timeStr}
👨‍⚕️ *Médico:* ${doctorName}

💳 *Próximo passo:* Realize o pagamento da consulta para confirmar.

No dia da consulta, você receberá o link do Google Meet por aqui.

Dúvidas? Responda esta mensagem.

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendPaymentConfirmation(
  phone: string,
  patientName: string,
  doctorName: string,
  appointmentDate: Date
): Promise<boolean> {
  const dateStr = appointmentDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
  
  const timeStr = appointmentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `✅ *ABRACANM - Pagamento Confirmado*

Olá, ${patientName}!

Seu pagamento foi confirmado com sucesso!

📅 *Consulta:* ${dateStr} às ${timeStr}
👨‍⚕️ *Médico:* ${doctorName}

No dia da consulta, você receberá o link do Google Meet por aqui.

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendMeetLink(
  phone: string,
  patientName: string,
  doctorName: string,
  meetLink: string
): Promise<boolean> {
  const message = `🎥 *ABRACANM - Sua Consulta Começa em Breve!*

Olá, ${patientName}!

Sua teleconsulta com ${doctorName} está prestes a começar.

🔗 *Acesse pelo link:*
${meetLink}

Dicas:
• Esteja em um local silencioso
• Verifique sua conexão de internet
• Tenha seus documentos em mãos

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendRegistrationApproval(
  phone: string,
  patientName: string,
  preAnamneseLink: string
): Promise<boolean> {
  const message = `🌿 *ABRACANM - Cadastro Validado!*

Olá, ${patientName}!

Temos uma ótima notícia: seu cadastro na ABRACANM foi *validado com sucesso*! ✅

Agora você faz parte da nossa comunidade de pacientes que buscam qualidade de vida através da cannabis medicinal.

📋 *Próximo passo:* Preencha sua pré-anamnese para agilizar seu atendimento médico.

👉 *Clique aqui para preencher:*
${preAnamneseLink}

A pré-anamnese nos ajuda a entender melhor suas necessidades e preparar sua consulta de forma personalizada.

Dúvidas? Responda esta mensagem ou entre em contato pelo email contato@abracanm.org.br

_ABRACANM - Associação Brasileira de Cannabis Medicinal_
_Acolhendo você na sua jornada de saúde_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendWelcomeMessage(
  phone: string,
  patientName: string,
  preAnamneseLink: string,
  codigoIndicacao?: string
): Promise<boolean> {
  let codigoTexto = '';
  if (codigoIndicacao) {
    codigoTexto = `

🎁 *Seu código de indicação:* ${codigoIndicacao}
Compartilhe com amigos e ganhe recompensas!`;
  }

  const message = `🌿 *Bem-vindo(a) à ABRACANM!*

Olá, ${patientName}!

Seu cadastro foi realizado com sucesso! 🎉

Estamos muito felizes em ter você conosco nessa jornada de saúde e bem-estar com cannabis medicinal.

📋 *Próximo passo:* Preencha sua pré-anamnese para que possamos entender melhor suas necessidades.

👉 *Clique aqui para preencher:*
${preAnamneseLink}${codigoTexto}

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendPreAnamneseCompleted(
  phone: string,
  patientName: string,
  agendamentoLink: string
): Promise<boolean> {
  const message = `✅ *ABRACANM - Pré-anamnese Preenchida!*

Olá, ${patientName}!

Sua pré-anamnese foi preenchida com sucesso! 📋

Agora você está mais perto de iniciar seu tratamento com cannabis medicinal.

📅 *Próximo passo:* Agende sua consulta com um de nossos médicos especialistas.

👉 *Clique aqui para agendar:*
${agendamentoLink}

Nossos médicos analisarão suas informações para oferecer o melhor tratamento personalizado.

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendReferralNotification(
  phone: string,
  indicadorNome: string,
  indicadoNome: string,
  pontosGanhos: number,
  totalPontos: number,
  nivelAtual: string
): Promise<boolean> {
  const message = `🎉 *ABRACANM - Nova Indicação!*

Olá, ${indicadorNome}!

Ótima notícia! *${indicadoNome}* se cadastrou usando seu código de indicação! 🌟

🏆 *+${pontosGanhos} pontos* adicionados à sua conta!
📊 *Total de pontos:* ${totalPontos}
🌿 *Seu nível:* ${nivelAtual}

Continue indicando amigos e desbloqueie mais recompensas!

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}

export async function sendLevelUpNotification(
  phone: string,
  patientName: string,
  novoNivel: string,
  nivelEmoji: string,
  beneficios: string[]
): Promise<boolean> {
  const beneficiosTexto = beneficios.map(b => `• ${b}`).join('\n');

  const message = `🎊 *ABRACANM - Você Subiu de Nível!*

Parabéns, ${patientName}! 🌟

Você alcançou o nível *${nivelEmoji} ${novoNivel}*!

🎁 *Novos benefícios desbloqueados:*
${beneficiosTexto}

Continue indicando amigos e suba ainda mais!

_ABRACANM - Associação Brasileira de Cannabis Medicinal_`;

  return sendWhatsAppMessageWithDelay({ phone, message });
}
