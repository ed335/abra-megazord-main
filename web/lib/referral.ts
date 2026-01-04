import { prisma } from '@/lib/prisma';

export type NivelIndicacao = 'SEMENTE' | 'BROTO' | 'FLORACAO' | 'COLHEITA' | 'EMBAIXADOR';

export interface NivelInfo {
  nivel: NivelIndicacao;
  nome: string;
  emoji: string;
  minIndicacoes: number;
  maxIndicacoes: number | null;
  beneficios: string[];
  descontoConsulta: number;
}

export const NIVEIS_INDICACAO: Record<NivelIndicacao, NivelInfo> = {
  SEMENTE: {
    nivel: 'SEMENTE',
    nome: 'Semente',
    emoji: '🌱',
    minIndicacoes: 0,
    maxIndicacoes: 0,
    beneficios: ['Badge no perfil'],
    descontoConsulta: 0,
  },
  BROTO: {
    nivel: 'BROTO',
    nome: 'Broto',
    emoji: '🌿',
    minIndicacoes: 1,
    maxIndicacoes: 2,
    beneficios: ['Badge Broto', '5% desconto na próxima consulta'],
    descontoConsulta: 5,
  },
  FLORACAO: {
    nivel: 'FLORACAO',
    nome: 'Floração',
    emoji: '🌸',
    minIndicacoes: 3,
    maxIndicacoes: 5,
    beneficios: ['Badge Floração', '10% desconto nas consultas', 'Prioridade no agendamento'],
    descontoConsulta: 10,
  },
  COLHEITA: {
    nivel: 'COLHEITA',
    nome: 'Colheita',
    emoji: '🌳',
    minIndicacoes: 6,
    maxIndicacoes: 10,
    beneficios: ['Badge Colheita', '15% desconto nas consultas', 'Prioridade no agendamento'],
    descontoConsulta: 15,
  },
  EMBAIXADOR: {
    nivel: 'EMBAIXADOR',
    nome: 'Embaixador',
    emoji: '🏆',
    minIndicacoes: 11,
    maxIndicacoes: null,
    beneficios: ['Badge Embaixador VIP', '20% desconto nas consultas', 'Consulta grátis a cada 5 indicações', 'Prioridade máxima'],
    descontoConsulta: 20,
  },
};

export function calcularNivel(totalIndicacoes: number): NivelIndicacao {
  if (totalIndicacoes >= 11) return 'EMBAIXADOR';
  if (totalIndicacoes >= 6) return 'COLHEITA';
  if (totalIndicacoes >= 3) return 'FLORACAO';
  if (totalIndicacoes >= 1) return 'BROTO';
  return 'SEMENTE';
}

export function gerarCodigoIndicacao(nome: string): string {
  const primeiroNome = nome.split(' ')[0].toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const nomeLimpo = primeiroNome.replace(/[^A-Z]/g, '').substring(0, 6);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${nomeLimpo}${randomNum}`;
}

export async function gerarCodigoUnico(nome: string): Promise<string> {
  let codigo = gerarCodigoIndicacao(nome);
  let tentativas = 0;
  
  while (tentativas < 10) {
    const existente = await prisma.paciente.findUnique({
      where: { codigoIndicacao: codigo },
    });
    
    if (!existente) {
      return codigo;
    }
    
    codigo = gerarCodigoIndicacao(nome);
    tentativas++;
  }
  
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${nome.substring(0, 3).toUpperCase()}${timestamp}`;
}

export async function processarIndicacao(indicadorId: string, indicadoNome: string, indicadoEmail: string) {
  const indicador = await prisma.paciente.findUnique({
    where: { id: indicadorId },
    include: { indicados: true },
  });

  if (!indicador) {
    throw new Error('Indicador não encontrado');
  }

  const totalIndicacoes = indicador.indicados.length + 1;
  const novoNivel = calcularNivel(totalIndicacoes);
  const pontosGanhos = 10;

  await prisma.historicoIndicacao.create({
    data: {
      indicadorId,
      indicadoNome,
      indicadoEmail,
      pontosGanhos,
      nivelNoMomento: indicador.nivelIndicacao,
      validada: true,
      validadaEm: new Date(),
    },
  });

  const atualizacao: { pontosIndicacao: number; nivelIndicacao?: NivelIndicacao } = {
    pontosIndicacao: indicador.pontosIndicacao + pontosGanhos,
  };

  if (novoNivel !== indicador.nivelIndicacao) {
    atualizacao.nivelIndicacao = novoNivel;
    
    const nivelInfo = NIVEIS_INDICACAO[novoNivel];
    if (nivelInfo.descontoConsulta > 0) {
      await prisma.recompensaIndicacao.create({
        data: {
          pacienteId: indicadorId,
          tipo: 'DESCONTO_CONSULTA',
          descricao: `${nivelInfo.descontoConsulta}% de desconto nas consultas`,
          valorDesconto: nivelInfo.descontoConsulta,
          nivelDesbloqueio: novoNivel,
        },
      });
    }

    if (novoNivel === 'EMBAIXADOR' && totalIndicacoes % 5 === 0) {
      await prisma.recompensaIndicacao.create({
        data: {
          pacienteId: indicadorId,
          tipo: 'CONSULTA_GRATIS',
          descricao: 'Consulta gratuita - Bônus Embaixador',
          nivelDesbloqueio: novoNivel,
        },
      });
    }
  }

  await prisma.paciente.update({
    where: { id: indicadorId },
    data: atualizacao,
  });

  return {
    novoNivel,
    pontosGanhos,
    totalIndicacoes,
    subiuDeNivel: novoNivel !== indicador.nivelIndicacao,
  };
}

export async function getDashboardIndicacao(pacienteId: string) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    include: {
      indicados: {
        select: {
          id: true,
          nome: true,
          criadoEm: true,
        },
        orderBy: { criadoEm: 'desc' },
        take: 10,
      },
      historicoIndicacoes: {
        orderBy: { criadoEm: 'desc' },
        take: 10,
      },
      recompensas: {
        where: { status: 'DISPONIVEL' },
        orderBy: { criadoEm: 'desc' },
      },
    },
  });

  if (!paciente) {
    throw new Error('Paciente não encontrado');
  }

  const totalIndicacoes = paciente.indicados.length;
  const nivelAtual = paciente.nivelIndicacao as NivelIndicacao;
  const nivelInfo = NIVEIS_INDICACAO[nivelAtual];
  
  const niveis = Object.values(NIVEIS_INDICACAO);
  const indiceAtual = niveis.findIndex(n => n.nivel === nivelAtual);
  const proximoNivel = indiceAtual < niveis.length - 1 ? niveis[indiceAtual + 1] : null;
  
  const indicacoesParaProximoNivel = proximoNivel 
    ? proximoNivel.minIndicacoes - totalIndicacoes 
    : 0;

  return {
    codigoIndicacao: paciente.codigoIndicacao,
    pontos: paciente.pontosIndicacao,
    totalIndicacoes,
    nivel: {
      ...nivelInfo,
      atual: true,
    },
    proximoNivel: proximoNivel ? {
      ...proximoNivel,
      indicacoesFaltando: indicacoesParaProximoNivel,
    } : null,
    indicadosRecentes: paciente.indicados.map(i => ({
      nome: i.nome,
      data: i.criadoEm,
    })),
    recompensasDisponiveis: paciente.recompensas,
  };
}
