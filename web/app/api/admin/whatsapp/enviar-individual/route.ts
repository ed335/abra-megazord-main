import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { sendWhatsAppMessage } from '@/lib/evolution';
import { registrarLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { whatsapp, mensagem, pacienteId, pacienteNome } = body as {
      whatsapp: string;
      mensagem: string;
      pacienteId?: string;
      pacienteNome?: string;
    };

    if (!whatsapp || !mensagem) {
      return NextResponse.json(
        { error: 'WhatsApp e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findFirst({
      where: { usuario: { id: decoded.sub } },
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Admin não encontrado' },
        { status: 403 }
      );
    }

    const sucesso = await sendWhatsAppMessage({
      phone: whatsapp,
      message: mensagem,
    });

    await prisma.mensagemWhatsApp.create({
      data: {
        adminId: admin.id,
        tipo: 'INDIVIDUAL',
        status: sucesso ? 'ENVIADA' : 'FALHA',
        destinatarioId: pacienteId || null,
        destinatarioNome: pacienteNome || null,
        destinatarioWhatsapp: whatsapp,
        mensagem,
        erro: sucesso ? null : 'Falha ao enviar via Evolution API',
      },
    });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'ENVIO_WHATSAPP',
      recurso: 'WHATSAPP',
      detalhes: {
        whatsapp,
        pacienteId: pacienteId || null,
        pacienteNome: pacienteNome || null,
        sucesso,
      },
    });

    if (!sucesso) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Falha ao enviar mensagem. Verifique se a Evolution API está configurada corretamente.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem individual:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}
