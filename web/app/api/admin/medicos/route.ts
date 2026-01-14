import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, getPrismaClient } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const prisma = getPrismaClient();

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyAdminToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Acesso não autorizado' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'todos';
    const busca = searchParams.get('busca') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'pendentes') {
      where.crmVerificado = false;
    } else if (status === 'aprovados') {
      where.crmVerificado = true;
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { crm: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
        { especialidade: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const [medicos, total, stats] = await Promise.all([
      prisma.prescritor.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              ativo: true,
              criadoEm: true,
            },
          },
          _count: {
            select: {
              agendamentos: true,
              prescricoes: true,
            },
          },
        },
        orderBy: { criadoEm: 'desc' },
        skip,
        take: limit,
      }),
      prisma.prescritor.count({ where }),
      prisma.prescritor.groupBy({
        by: ['crmVerificado'],
        _count: { id: true },
      }),
    ]);

    const pendentes = stats.find(s => s.crmVerificado === false)?._count?.id || 0;
    const aprovados = stats.find(s => s.crmVerificado === true)?._count?.id || 0;

    const medicosFormatados = medicos.map(m => ({
      id: m.id,
      usuarioId: m.usuarioId,
      nome: m.nome,
      email: m.email,
      crm: m.crm,
      especialidade: m.especialidade,
      instituicao: m.instituicao,
      telefone: m.telefone,
      whatsapp: m.whatsapp,
      fotoUrl: m.fotoUrl,
      crmVerificado: m.crmVerificado,
      dataVerificacao: m.dataVerificacao,
      usuarioAtivo: m.usuario.ativo,
      criadoEm: m.criadoEm,
      totalConsultas: m._count.agendamentos,
      totalPrescricoes: m._count.prescricoes,
      aceitaNovosPacientes: m.aceitaNovosPacientes,
      duracaoConsulta: m.duracaoConsulta,
    }));

    return NextResponse.json({
      medicos: medicosFormatados,
      stats: {
        total: pendentes + aprovados,
        pendentes,
        aprovados,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao listar médicos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar médicos' },
      { status: 500 }
    );
  }
}
