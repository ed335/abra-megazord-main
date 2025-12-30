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

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalAssociados,
      associadosAtivos,
      associadosInativos,
      novosEsteMes,
      novosMesPassado,
      comDocumentosMedicos,
      semDocumentosMedicos,
      comPreAnamnese,
      semPreAnamnese,
      porEstado,
      porPatologia,
      cadastrosPorMes,
    ] = await Promise.all([
      prisma.paciente.count(),
      
      prisma.paciente.count({
        where: { usuario: { ativo: true } }
      }),
      
      prisma.paciente.count({
        where: { usuario: { ativo: false } }
      }),
      
      prisma.paciente.count({
        where: { criadoEm: { gte: startOfMonth } }
      }),
      
      prisma.paciente.count({
        where: { 
          criadoEm: { 
            gte: startOfLastMonth,
            lte: endOfLastMonth 
          } 
        }
      }),
      
      prisma.paciente.count({
        where: { documentosMedicosUrls: { isEmpty: false } }
      }),
      
      prisma.paciente.count({
        where: { documentosMedicosUrls: { isEmpty: true } }
      }),
      
      prisma.paciente.count({
        where: { preAnamnese: { isNot: null } }
      }),
      
      prisma.paciente.count({
        where: { preAnamnese: null }
      }),
      
      prisma.paciente.groupBy({
        by: ['estado'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      
      prisma.paciente.groupBy({
        by: ['patologiaCID'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
        where: { patologiaCID: { not: null } },
      }),
      
      prisma.$queryRaw`
        SELECT 
          TO_CHAR("criadoEm", 'YYYY-MM') as mes,
          COUNT(*)::int as total
        FROM "Paciente"
        WHERE "criadoEm" >= NOW() - INTERVAL '12 months'
        GROUP BY TO_CHAR("criadoEm", 'YYYY-MM')
        ORDER BY mes ASC
      ` as Promise<{ mes: string; total: number }[]>,
    ]);

    const crescimento = novosMesPassado > 0 
      ? Math.round(((novosEsteMes - novosMesPassado) / novosMesPassado) * 100) 
      : novosEsteMes > 0 ? 100 : 0;

    return NextResponse.json({
      resumo: {
        total: totalAssociados,
        ativos: associadosAtivos,
        inativos: associadosInativos,
        novosEsteMes,
        novosMesPassado,
        crescimento,
        comDocumentosMedicos,
        semDocumentosMedicos,
        comPreAnamnese,
        semPreAnamnese,
      },
      porEstado: porEstado.map(e => ({
        estado: e.estado || 'Não informado',
        total: e._count.id,
      })),
      porPatologia: porPatologia.map(p => ({
        patologia: p.patologiaCID || 'Não informado',
        total: p._count.id,
      })),
      cadastrosPorMes,
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    );
  }
}
