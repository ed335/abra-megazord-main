import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/admin-auth';
import { sendWhatsAppMessage } from '@/lib/evolution';
import { registrarLog } from '@/lib/audit-log';
import type { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface DestinatarioInput {
  id?: string;
  nome: string;
  whatsapp: string;
  mensagem: string;
}

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
    const { destinatarios, templateNome, filtrosUsados, tipo = 'MASSA' } = body as {
      destinatarios: DestinatarioInput[];
      templateNome?: string;
      filtrosUsados?: Prisma.InputJsonValue;
      tipo?: 'INDIVIDUAL' | 'MASSA';
    };

    if (!destinatarios || !Array.isArray(destinatarios) || destinatarios.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum destinatário informado' },
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

    const lote = await prisma.loteMensagemWhatsApp.create({
      data: {
        adminId: admin.id,
        templateNome,
        templateTexto: destinatarios[0]?.mensagem || '',
        filtrosUsados: filtrosUsados || undefined,
        totalDestinatarios: destinatarios.length,
        status: 'EM_ANDAMENTO',
      },
    });

    const resultados: { sucesso: boolean; nome: string; whatsapp: string; erro?: string }[] = [];
    let enviadas = 0;
    let falhas = 0;

    for (const dest of destinatarios) {
      try {
        const sucesso = await sendWhatsAppMessage({
          phone: dest.whatsapp,
          message: dest.mensagem,
        });

        await prisma.mensagemWhatsApp.create({
          data: {
            adminId: admin.id,
            tipo: tipo === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'MASSA',
            status: sucesso ? 'ENVIADA' : 'FALHA',
            destinatarioId: dest.id || null,
            destinatarioNome: dest.nome,
            destinatarioWhatsapp: dest.whatsapp,
            templateNome,
            mensagem: dest.mensagem,
            filtrosUsados: filtrosUsados || undefined,
            erro: sucesso ? null : 'Falha ao enviar via Evolution API',
          },
        });

        if (sucesso) {
          enviadas++;
          resultados.push({ sucesso: true, nome: dest.nome, whatsapp: dest.whatsapp });
        } else {
          falhas++;
          resultados.push({ sucesso: false, nome: dest.nome, whatsapp: dest.whatsapp, erro: 'Falha ao enviar' });
        }

        if (destinatarios.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (err) {
        falhas++;
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        resultados.push({ sucesso: false, nome: dest.nome, whatsapp: dest.whatsapp, erro: errorMessage });
        
        await prisma.mensagemWhatsApp.create({
          data: {
            adminId: admin.id,
            tipo: tipo === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'MASSA',
            status: 'FALHA',
            destinatarioId: dest.id || null,
            destinatarioNome: dest.nome,
            destinatarioWhatsapp: dest.whatsapp,
            templateNome,
            mensagem: dest.mensagem,
            filtrosUsados: filtrosUsados || undefined,
            erro: errorMessage,
          },
        });
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

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'ENVIO_WHATSAPP',
      recurso: 'WHATSAPP',
      detalhes: {
        loteId: lote.id,
        totalDestinatarios: destinatarios.length,
        enviadas,
        falhas,
        templateNome: templateNome || null,
        filtros: filtrosUsados || null,
      },
    });

    return NextResponse.json({
      success: true,
      loteId: lote.id,
      total: destinatarios.length,
      enviadas,
      falhas,
      resultados,
    });
  } catch (error) {
    console.error('Erro ao enviar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagens' },
      { status: 500 }
    );
  }
}
