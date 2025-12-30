const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

interface SendMessageOptions {
  phone: string;
  message: string;
}

export async function sendWhatsAppMessage({ phone, message }: SendMessageOptions): Promise<boolean> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.warn('Evolution API não configurada');
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

    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
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

  return sendWhatsAppMessage({ phone, message });
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

  return sendWhatsAppMessage({ phone, message });
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

  return sendWhatsAppMessage({ phone, message });
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

  return sendWhatsAppMessage({ phone, message });
}
