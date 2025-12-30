import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jsonwebtoken from 'jsonwebtoken';
export const dynamic = 'force-dynamic';

interface PreAnamneseRequest {
  perfil: 'PACIENTE_NOVO' | 'EM_TRATAMENTO' | 'CUIDADOR' | string;
  objetivoPrincipal: string;
  objetivoOutro?: string;
  gravidade?: number;
  tratamentosPrevios?: string[];
  tratamentoOutro?: string;
  comorbidades?: string[];
  comorbidadeOutro?: string;
  notas?: string;
  preferenciaAcompanhamento?: string;
  melhorHorario?: string;
  idade?: string;
  peso?: string;
  altura?: string;
  objetivoSecundario?: string[];
  tempoSintomas?: string;
  intensidadeSintomas?: number;
  frequenciaSintomas?: string;
  usouCannabis?: string;
  experienciaCannabis?: string;
  medicamentosAtuais?: string[];
  medicamentoOutro?: string;
  alergiaMedicamentos?: string;
  condicoesSaude?: string[];
  condicaoOutra?: string;
  historicoFamiliar?: string[];
  tabagismo?: string;
  alcool?: string;
  atividadeFisica?: string;
  qualidadeSono?: string;
  nivelEstresse?: number;
  expectativasTratamento?: string[];
  preocupacoes?: string;
  disponibilidadeHorario?: string;
  preferenciaContato?: string;
  consentimento?: boolean;
}

interface ScoreExplanation {
  criterio: string;
  descricao: string;
  pontos: number;
}

interface DiagnosticoResult {
  titulo: string;
  resumo: string;
  nivelUrgencia: 'baixa' | 'moderada' | 'alta';
  indicacoes: string[];
  contraindicacoes: string[];
  observacoes: string;
  scoreExplicacao?: ScoreExplanation[];
}

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado');
  }
  return secret;
}

function generateDiagnostico(data: PreAnamneseRequest, patologiaCID: string | null, jaUsaCannabis: boolean): DiagnosticoResult {
  const diagnostico: DiagnosticoResult = {
    titulo: '',
    resumo: '',
    nivelUrgencia: 'baixa',
    indicacoes: [],
    contraindicacoes: [],
    observacoes: ''
  };

  const intensidade = data.intensidadeSintomas || data.gravidade || 5;
  const usaCannabis = jaUsaCannabis || data.usouCannabis === 'uso_atual';

  if (usaCannabis) {
    diagnostico.titulo = 'Acompanhamento de Paciente em Tratamento';
    diagnostico.resumo = 'Você já utiliza cannabis medicinal. Recomendamos uma consulta para avaliar a eficácia do tratamento atual e possíveis ajustes.';
  } else if (data.perfil === 'CUIDADOR' || data.perfil === 'cuidador' || data.perfil === 'familiar') {
    diagnostico.titulo = 'Orientação para Cuidador';
    diagnostico.resumo = 'Como cuidador, você terá acesso a orientações especializadas para apoiar o tratamento do paciente sob sua responsabilidade.';
  } else {
    diagnostico.titulo = 'Avaliação Inicial para Cannabis Medicinal';
    diagnostico.resumo = 'Baseado nas suas respostas, identificamos que você pode se beneficiar de uma avaliação médica especializada em cannabis medicinal.';
  }

  if (intensidade >= 8) {
    diagnostico.nivelUrgencia = 'alta';
    diagnostico.observacoes = 'Seus sintomas indicam alta intensidade. Recomendamos agendar uma consulta o mais breve possível.';
  } else if (intensidade >= 5) {
    diagnostico.nivelUrgencia = 'moderada';
    diagnostico.observacoes = 'Sintomas de intensidade moderada identificados. Uma consulta nas próximas semanas é aconselhável.';
  } else {
    diagnostico.nivelUrgencia = 'baixa';
    diagnostico.observacoes = 'Sintomas de baixa intensidade. Você pode agendar sua consulta conforme sua disponibilidade.';
  }

  if (patologiaCID) {
    const patologias: Record<string, string[]> = {
      'G40': ['Epilepsia - tratamento com CBD tem forte evidência científica', 'Possível redução de crises convulsivas'],
      'R52.1': ['Dor crônica - cannabis pode auxiliar no manejo da dor', 'Possível redução do uso de opioides'],
      'F41': ['Ansiedade - CBD demonstra potencial ansiolítico', 'Melhora na qualidade do sono como benefício secundário'],
      'M79.7': ['Fibromialgia - cannabis pode ajudar no controle da dor e sono', 'Melhora potencial na qualidade de vida'],
      'G35': ['Esclerose Múltipla - evidências para espasticidade', 'Possível melhora em dor neuropática'],
      'G20': ['Parkinson - potencial melhora em tremores e rigidez', 'CBD pode auxiliar em sintomas não-motores'],
      'F84.0': ['TEA - estudos mostram melhora em agitação e sono', 'CBD pode auxiliar em comportamentos repetitivos'],
      'F90': ['TDAH - pesquisas em andamento mostram potencial', 'Pode auxiliar na regulação do foco e ansiedade'],
      'G47.0': ['Insônia - THC e CBD podem melhorar qualidade do sono', 'Redução do tempo para adormecer'],
    };

    const cidCode = patologiaCID.split(' ')[0]?.replace(/[()]/g, '');
    if (cidCode && patologias[cidCode]) {
      diagnostico.indicacoes = patologias[cidCode];
    } else {
      diagnostico.indicacoes = ['Avaliação médica necessária para determinar indicações específicas'];
    }
  }

  const comorbidades = data.comorbidades || data.condicoesSaude || [];
  if (comorbidades.includes('Gestação/planejamento')) {
    diagnostico.contraindicacoes.push('Cannabis é contraindicada durante gestação e amamentação');
    diagnostico.nivelUrgencia = 'alta';
  }
  if (comorbidades.includes('Histórico psiquiátrico') || comorbidades.includes('Transtornos psiquiátricos')) {
    diagnostico.contraindicacoes.push('Avaliação psiquiátrica recomendada antes de iniciar tratamento');
  }

  return diagnostico;
}

function generateRecomendacoes(data: PreAnamneseRequest, diagnostico: DiagnosticoResult): string[] {
  const recomendacoes: string[] = [];

  recomendacoes.push('Agende uma consulta com um médico prescritor da ABRACANM');

  const tratamentos = data.tratamentosPrevios || data.medicamentosAtuais || [];
  if (tratamentos.length > 0 && !tratamentos.includes('Nenhum')) {
    recomendacoes.push('Leve seus laudos e receitas de tratamentos anteriores para a consulta');
  }

  if (diagnostico.nivelUrgencia === 'alta') {
    recomendacoes.push('Priorize o agendamento da consulta devido à intensidade dos sintomas');
  }

  if (data.perfil === 'CUIDADOR' || data.perfil === 'cuidador' || data.perfil === 'familiar') {
    recomendacoes.push('Providencie documentação que comprove a tutela ou responsabilidade pelo paciente');
  }

  recomendacoes.push('Mantenha um diário de sintomas até a data da consulta');

  return recomendacoes;
}

function generateProximoPasso(preferencia: string): string {
  if (preferencia === 'Online') {
    return 'Agende sua teleconsulta com um médico prescritor especializado em cannabis medicinal';
  } else if (preferencia === 'Presencial') {
    return 'Encontre um médico prescritor parceiro da ABRACANM próximo à sua região';
  }
  return 'Escolha entre teleconsulta ou atendimento presencial e agende sua avaliação médica';
}

function calculateScorePrioridade(data: PreAnamneseRequest, diagnostico: DiagnosticoResult): { score: number; explicacao: ScoreExplanation[] } {
  const explicacao: ScoreExplanation[] = [];
  let score = 0;
  
  const gravidade = data.gravidade || Math.ceil((data.intensidadeSintomas || 5) / 2);
  const gravidadePontos = gravidade * 20;
  explicacao.push({
    criterio: 'Intensidade dos Sintomas',
    descricao: `Você indicou nível ${gravidade} de 5 na escala de gravidade`,
    pontos: gravidadePontos
  });
  score += gravidadePontos;
  
  if (diagnostico.nivelUrgencia === 'alta') {
    explicacao.push({
      criterio: 'Urgência Clínica',
      descricao: 'Condição identificada como alta prioridade médica',
      pontos: 30
    });
    score += 30;
  } else if (diagnostico.nivelUrgencia === 'moderada') {
    explicacao.push({
      criterio: 'Urgência Clínica',
      descricao: 'Condição identificada como prioridade moderada',
      pontos: 15
    });
    score += 15;
  }
  
  if (diagnostico.contraindicacoes.length > 0) {
    explicacao.push({
      criterio: 'Atenção Especial',
      descricao: 'Existem fatores que requerem avaliação médica cuidadosa',
      pontos: 10
    });
    score += 10;
  }
  
  const tratamentos = data.tratamentosPrevios || data.medicamentosAtuais || [];
  if (tratamentos.length > 0 && !tratamentos.includes('Nenhum')) {
    explicacao.push({
      criterio: 'Histórico de Tratamento',
      descricao: 'Você já tentou outros tratamentos anteriormente',
      pontos: 5
    });
    score += 5;
  }
  
  return { score: Math.min(score, 100), explicacao };
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

export async function POST(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Você precisa estar logado para responder a pré-anamnese' },
        { status: 401 }
      );
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: decoded.sub }
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Perfil de paciente não encontrado' },
        { status: 404 }
      );
    }

    const existingPreAnamnese = await prisma.preAnamnese.findUnique({
      where: { pacienteId: paciente.id }
    });

    if (existingPreAnamnese) {
      return NextResponse.json(
        { error: 'Você já respondeu a pré-anamnese. Acesse seu diagnóstico no dashboard.' },
        { status: 400 }
      );
    }

    const body: PreAnamneseRequest = await request.json();

    const diagnostico = generateDiagnostico(body, paciente.patologiaCID, paciente.jaUsaCannabis);
    const recomendacoes = generateRecomendacoes(body, diagnostico);
    const preferenciaAcomp = body.preferenciaAcompanhamento || body.preferenciaContato || 'Online';
    const proximoPasso = generateProximoPasso(preferenciaAcomp);
    const { score: scorePrioridade, explicacao: scoreExplicacao } = calculateScorePrioridade(body, diagnostico);
    
    diagnostico.scoreExplicacao = scoreExplicacao;

    const perfilMap: Record<string, 'PACIENTE_NOVO' | 'EM_TRATAMENTO' | 'CUIDADOR'> = {
      paciente: 'PACIENTE_NOVO',
      cuidador: 'CUIDADOR',
      familiar: 'CUIDADOR',
      PACIENTE_NOVO: 'PACIENTE_NOVO',
      EM_TRATAMENTO: 'EM_TRATAMENTO',
      CUIDADOR: 'CUIDADOR',
    };
    const perfilNormalizado = perfilMap[body.perfil] || 'PACIENTE_NOVO';
    const gravidadeNormalizada = body.gravidade || Math.ceil((body.intensidadeSintomas || 5) / 2);

    const dadosExtras = {
      idade: body.idade,
      peso: body.peso,
      altura: body.altura,
      tempoSintomas: body.tempoSintomas,
      intensidadeSintomas: body.intensidadeSintomas,
      frequenciaSintomas: body.frequenciaSintomas,
      usouCannabis: body.usouCannabis,
      experienciaCannabis: body.experienciaCannabis,
      medicamentosAtuais: body.medicamentosAtuais,
      alergiaMedicamentos: body.alergiaMedicamentos,
      condicoesSaude: body.condicoesSaude,
      historicoFamiliar: body.historicoFamiliar,
      tabagismo: body.tabagismo,
      alcool: body.alcool,
      atividadeFisica: body.atividadeFisica,
      qualidadeSono: body.qualidadeSono,
      nivelEstresse: body.nivelEstresse,
      expectativasTratamento: body.expectativasTratamento,
      preocupacoes: body.preocupacoes,
      disponibilidadeHorario: body.disponibilidadeHorario,
      preferenciaContato: body.preferenciaContato,
    };

    const diagnosticoCompleto = {
      ...diagnostico,
      dadosExtras,
    };

    await prisma.preAnamnese.create({
      data: {
        pacienteId: paciente.id,
        perfil: perfilNormalizado,
        objetivoPrincipal: body.objetivoPrincipal,
        objetivoOutro: body.objetivoOutro || null,
        gravidade: gravidadeNormalizada,
        tratamentosPrevios: body.tratamentosPrevios || body.medicamentosAtuais || [],
        tratamentoOutro: body.tratamentoOutro || body.medicamentoOutro || null,
        comorbidades: body.comorbidades || body.condicoesSaude || [],
        comorbidadeOutro: body.comorbidadeOutro || body.condicaoOutra || null,
        notas: body.notas || body.preocupacoes || null,
        preferenciaAcompanhamento: preferenciaAcomp,
        melhorHorario: body.melhorHorario || body.disponibilidadeHorario || 'manha',
        diagnostico: JSON.parse(JSON.stringify(diagnosticoCompleto)),
        scorePrioridade: scorePrioridade,
        recomendacoes: recomendacoes,
        proximosPasso: proximoPasso
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pré-anamnese salva com sucesso',
      diagnostico: {
        ...diagnostico,
        recomendacoes,
        proximoPasso,
        scorePrioridade,
        scoreExplicacao
      }
    });

  } catch (error) {
    console.error('Erro na pré-anamnese:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pré-anamnese' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const paciente = await prisma.paciente.findUnique({
      where: { usuarioId: decoded.sub }
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Perfil de paciente não encontrado' },
        { status: 404 }
      );
    }

    const preAnamnese = await prisma.preAnamnese.findUnique({
      where: { pacienteId: paciente.id }
    });

    if (!preAnamnese) {
      return NextResponse.json({
        completed: false,
        message: 'Pré-anamnese ainda não respondida'
      });
    }

    return NextResponse.json({
      completed: true,
      preAnamnese: preAnamnese
    });

  } catch (error) {
    console.error('Erro ao buscar pré-anamnese:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pré-anamnese' },
      { status: 500 }
    );
  }
}
