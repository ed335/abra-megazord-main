import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado. Apenas administradores podem acessar.' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const search = url.searchParams.get('search') || '';
    const cidade = url.searchParams.get('cidade') || '';
    const estado = url.searchParams.get('estado') || '';
    const patologia = url.searchParams.get('patologia') || '';
    const status = url.searchParams.get('status') || '';
    const temAnamnese = url.searchParams.get('temAnamnese') || '';

    const where: any = {};
    
    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { whatsapp: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (cidade) {
      where.cidade = { contains: cidade, mode: 'insensitive' };
    }
    
    if (estado) {
      where.estado = estado.toUpperCase();
    }
    
    if (patologia) {
      where.patologiaCID = { contains: patologia, mode: 'insensitive' };
    }
    
    if (status === 'ativo') {
      where.usuario = { ativo: true };
    } else if (status === 'inativo') {
      where.usuario = { ativo: false };
    }
    
    if (temAnamnese === 'sim') {
      where.documentosMedicosUrls = { isEmpty: false };
    } else if (temAnamnese === 'nao') {
      where.documentosMedicosUrls = { isEmpty: true };
    }

    const [associados, total] = await Promise.all([
      prisma.paciente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          nome: true,
          email: true,
          whatsapp: true,
          cidade: true,
          estado: true,
          jaUsaCannabis: true,
          patologiaCID: true,
          termoAjuizamento: true,
          consenteLGPD: true,
          criadoEm: true,
          usuarioId: true,
          usuario: {
            select: {
              ativo: true,
              emailVerificado: true,
            }
          },
          preAnamnese: {
            select: {
              id: true,
              perfil: true,
              objetivoPrincipal: true,
              gravidade: true,
              tratamentosPrevios: true,
              comorbidades: true,
              notas: true,
              preferenciaAcompanhamento: true,
              melhorHorario: true,
              diagnostico: true,
              scorePrioridade: true,
              recomendacoes: true,
              proximosPasso: true,
              criadoEm: true,
            }
          }
        }
      }),
      prisma.paciente.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      associados,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Erro ao buscar associados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar associados' },
      { status: 500 }
    );
  }
}
