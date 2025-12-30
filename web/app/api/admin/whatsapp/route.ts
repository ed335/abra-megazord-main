import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';
import { registrarLog } from '@/lib/audit-log';
export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

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
    const { template, filtros, associadoIds } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template é obrigatório' },
        { status: 400 }
      );
    }

    let associados;
    
    if (associadoIds && associadoIds.length > 0) {
      associados = await prisma.paciente.findMany({
        where: { id: { in: associadoIds } },
        select: { id: true, nome: true, whatsapp: true, email: true, cidade: true, estado: true, patologiaCID: true }
      });
    } else {
      const where: Record<string, unknown> = {};
      
      if (filtros?.cidade) {
        where.cidade = { contains: filtros.cidade, mode: 'insensitive' };
      }
      if (filtros?.estado) {
        where.estado = filtros.estado;
      }
      if (filtros?.patologia) {
        where.patologiaCID = { contains: filtros.patologia, mode: 'insensitive' };
      }
      if (filtros?.status !== undefined) {
        where.usuario = { ativo: filtros.status === 'ativo' };
      }
      
      associados = await prisma.paciente.findMany({
        where,
        select: { id: true, nome: true, whatsapp: true, email: true, cidade: true, estado: true, patologiaCID: true }
      });
    }

    const mensagens = associados
      .filter(a => {
        if (!a.whatsapp) return false;
        const digits = a.whatsapp.replace(/\D/g, '');
        return digits.length >= 10;
      })
      .map(associado => {
        let mensagem = template;
        mensagem = mensagem.replace(/\{nome\}/gi, associado.nome || 'Associado');
        mensagem = mensagem.replace(/\{primeiro_nome\}/gi, (associado.nome || 'Associado').split(' ')[0]);
        mensagem = mensagem.replace(/\{cidade\}/gi, associado.cidade || '');
        mensagem = mensagem.replace(/\{estado\}/gi, associado.estado || '');
        mensagem = mensagem.replace(/\{patologia\}/gi, associado.patologiaCID || '');
        
        const whatsappFormatado = associado.whatsapp!.replace(/\D/g, '');
        const numero = whatsappFormatado.startsWith('55') ? whatsappFormatado : `55${whatsappFormatado}`;
        
        return {
          id: associado.id,
          nome: associado.nome,
          whatsapp: associado.whatsapp,
          numero,
          mensagem,
          link: `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
        };
      });

    await registrarLog({
      usuarioId: decoded.sub,
      acao: 'ENVIO_WHATSAPP',
      recurso: 'WHATSAPP',
      detalhes: { 
        template: template.substring(0, 100), 
        totalDestinatarios: mensagens.length,
        filtros: filtros || null
      },
    });

    return NextResponse.json({
      success: true,
      total: mensagens.length,
      mensagens,
    });
  } catch (error) {
    console.error('Erro ao preparar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao preparar mensagens' },
      { status: 500 }
    );
  }
}
