import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jsonwebtoken from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return secret;
}

async function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const jwtSecret = getJWTSecret();
    const decoded = jsonwebtoken.verify(token, jwtSecret) as { sub: string };
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenData = await verifyToken(request);
    if (!tokenData) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: tokenData.sub },
      include: {
        prescritor: true,
      },
    });

    if (!usuario || !usuario.prescritor) {
      return NextResponse.json({ error: 'Acesso permitido apenas para médicos' }, { status: 403 });
    }

    const prescritorId = usuario.prescritor.id;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'todos';

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    const endOfWeek = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);

    let whereClause: any = {
      prescritorId,
    };

    if (filter === 'hoje') {
      whereClause.dataHora = {
        gte: startOfDay,
        lt: endOfDay,
      };
    } else if (filter === 'semana') {
      whereClause.dataHora = {
        gte: startOfDay,
        lt: endOfWeek,
      };
    } else if (filter === 'aguardando') {
      whereClause.status = 'AGENDADO';
    } else if (filter === 'agendados') {
      whereClause.status = {
        in: ['AGENDADO', 'CONFIRMADO'],
      };
    }

    if (!whereClause.status) {
      whereClause.status = {
        in: ['PENDENTE_PAGAMENTO', 'AGENDADO', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO'],
      };
    }

    const agendamentos = await (prisma as any).agendamento.findMany({
      where: whereClause,
      include: {
        paciente: {
          include: {
            preAnamnese: true,
            assinaturas: {
              where: {
                status: 'ATIVA',
              },
              include: {
                plano: true,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        dataHora: 'asc',
      },
    });

    const consultasHoje = await prisma.agendamento.count({
      where: {
        prescritorId,
        dataHora: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const consultasSemana = await prisma.agendamento.count({
      where: {
        prescritorId,
        dataHora: {
          gte: startOfDay,
          lt: endOfWeek,
        },
      },
    });

    const aguardandoConfirmacao = await prisma.agendamento.count({
      where: {
        prescritorId,
        status: 'AGENDADO',
      },
    });

    const pacientes = agendamentos
      .map((ag: any) => {
        const paciente = ag.paciente;
        const preAnamnese = paciente.preAnamnese;
        const assinatura = paciente.assinaturas[0];
        
        const diagnosticoJson = preAnamnese?.diagnostico as any || {};
        const dadosExtras = diagnosticoJson.dadosExtras || {};

        return {
          id: paciente.id,
          nome: paciente.nome,
          email: paciente.email,
          whatsapp: paciente.telefone || '',
          telefone: paciente.telefone || '',
          cpf: paciente.cpf || '',
          cidade: paciente.cidade || null,
          estado: paciente.estado || null,
          patologiaCID: paciente.patologiaCID || null,
          jaUsaCannabis: paciente.jaUsaCannabis || false,
          criadoEm: paciente.criadoEm?.toISOString() || '',
          dataNascimento: paciente.dataNascimento?.toISOString() || '',
          fotoUrl: paciente.documentoIdentidadeUrl || null,
          preAnamnese: preAnamnese
            ? {
                objetivoPrincipal: preAnamnese.objetivoPrincipal,
                intensidadeSintomas: dadosExtras.intensidadeSintomas || preAnamnese.gravidade * 2,
                tempoSintomas: dadosExtras.tempoSintomas || '',
                frequenciaSintomas: dadosExtras.frequenciaSintomas || '',
                usouCannabis: dadosExtras.usouCannabis || (preAnamnese.perfil === 'EM_TRATAMENTO' ? 'uso_atual' : 'nunca'),
                experienciaCannabis: dadosExtras.experienciaCannabis || '',
                condicoesSaude: dadosExtras.condicoesSaude || preAnamnese.comorbidades || [],
                medicamentosAtuais: dadosExtras.medicamentosAtuais || preAnamnese.tratamentosPrevios || [],
                alergiaMedicamentos: dadosExtras.alergiaMedicamentos || '',
                historicoFamiliar: dadosExtras.historicoFamiliar || [],
                qualidadeSono: dadosExtras.qualidadeSono || '',
                nivelEstresse: dadosExtras.nivelEstresse || 5,
                tabagismo: dadosExtras.tabagismo || '',
                alcool: dadosExtras.alcool || '',
                expectativasTratamento: dadosExtras.expectativasTratamento || preAnamnese.recomendacoes || [],
                expectativasOutro: dadosExtras.expectativasOutro || '',
                preocupacoes: dadosExtras.preocupacoes || preAnamnese.notas || '',
                idade: dadosExtras.idade || '',
                peso: dadosExtras.peso || '',
                altura: dadosExtras.altura || '',
                disponibilidadeHorario: dadosExtras.disponibilidadeHorario || preAnamnese.melhorHorario || '',
                createdAt: preAnamnese.criadoEm.toISOString(),
                diagnostico: {
                  titulo: diagnosticoJson.titulo || '',
                  resumo: diagnosticoJson.resumo || '',
                  nivelUrgencia: diagnosticoJson.nivelUrgencia || 'baixa',
                  indicacoes: diagnosticoJson.indicacoes || [],
                  contraindicacoes: diagnosticoJson.contraindicacoes || [],
                },
              }
            : null,
          agendamento: {
            id: ag.id,
            dataHora: ag.dataHora.toISOString(),
            tipo: ag.tipo,
            status: ag.status,
            pagamentoStatus: 'PAGO',
          },
          plano: assinatura?.plano
            ? {
                nome: assinatura.plano.nome,
                tipo: assinatura.plano.tipo,
              }
            : null,
        };
      });

    let uniquePacientes = Array.from(
      new Map(pacientes.map((p: any) => [p.id, p])).values()
    ) as any[];

    if (filter === 'com-anamnese') {
      uniquePacientes = uniquePacientes.filter((p) => p.preAnamnese !== null);
    }

    return NextResponse.json({
      success: true,
      pacientes: uniquePacientes,
      stats: {
        totalPacientes: uniquePacientes.length,
        consultasHoje,
        consultasSemana,
        aguardandoConfirmacao,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pacientes' },
      { status: 500 }
    );
  }
}
