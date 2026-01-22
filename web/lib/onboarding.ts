import { PerfilOnboarding, StatusOnboarding, StatusDocumento, TipoDocumento } from '@prisma/client';

export interface DocumentoInfo {
  tipo: TipoDocumento;
  status: StatusDocumento;
  dataValidade?: Date | null;
}

export interface PacienteOnboarding {
  id: string;
  nome: string;
  perfilOnboarding: PerfilOnboarding | null;
  statusOnboarding: StatusOnboarding;
  etapaOnboarding: number;
  onboardingCompleto: boolean;
  objetivoPrincipalOnb: string | null;
  sintomasOnb: string[];
  documentos: DocumentoInfo[];
  assinaturas: { status: string; plano?: { nome: string } }[];
  cpf: string | null;
  dataNascimento: Date | null;
  whatsapp: string;
  consenteLGPD: boolean;
}

export interface NextStep {
  etapa: number;
  titulo: string;
  descricao: string;
  cta: string;
  rota: string;
  tempoEstimado?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  icone: string;
}

export const DOCUMENTOS_OBRIGATORIOS: Record<PerfilOnboarding, TipoDocumento[]> = {
  INICIANTE: ['IDENTIDADE_FRENTE'],
  PRESCRICAO: ['IDENTIDADE_FRENTE', 'PRESCRICAO'],
  ANVISA: ['IDENTIDADE_FRENTE', 'PRESCRICAO', 'AUTORIZACAO_ANVISA'],
};

export const DOCUMENTOS_OPCIONAIS: Record<PerfilOnboarding, TipoDocumento[]> = {
  INICIANTE: ['IDENTIDADE_VERSO', 'SELFIE', 'COMPROVANTE_ENDERECO'],
  PRESCRICAO: ['IDENTIDADE_VERSO', 'SELFIE', 'COMPROVANTE_ENDERECO', 'LAUDO_MEDICO'],
  ANVISA: ['IDENTIDADE_VERSO', 'SELFIE', 'COMPROVANTE_ENDERECO', 'LAUDO_MEDICO'],
};

export const DOCUMENTOS_POR_PERFIL = DOCUMENTOS_OBRIGATORIOS;

export function calcularProximoPasso(paciente: PacienteOnboarding): NextStep {
  const { perfilOnboarding, statusOnboarding, etapaOnboarding, documentos, assinaturas, cpf, dataNascimento, consenteLGPD, objetivoPrincipalOnb } = paciente;

  if (statusOnboarding === 'BLOQUEADO') {
    return {
      etapa: -1,
      titulo: 'Conta Bloqueada',
      descricao: 'Sua conta foi bloqueada. Entre em contato com o suporte.',
      cta: 'Falar com Suporte',
      rota: '/suporte',
      prioridade: 'alta',
      icone: 'AlertTriangle',
    };
  }

  if (statusOnboarding === 'ASSOCIADO_INATIVO') {
    return {
      etapa: 4,
      titulo: 'Reativar Associação',
      descricao: 'Sua associação está inativa. Renove sua contribuição para continuar.',
      cta: 'Renovar Agora',
      rota: '/onboarding?etapa=4',
      prioridade: 'alta',
      icone: 'CreditCard',
    };
  }

  if (!perfilOnboarding) {
    return {
      etapa: 0,
      titulo: 'Escolha seu Perfil',
      descricao: 'Selecione a opção que melhor descreve sua situação atual.',
      cta: 'Começar',
      rota: '/onboarding?etapa=0',
      tempoEstimado: '~30s',
      prioridade: 'alta',
      icone: 'UserCircle',
    };
  }

  if (!cpf || !dataNascimento || !consenteLGPD) {
    return {
      etapa: 1,
      titulo: 'Complete seus Dados',
      descricao: 'Precisamos de algumas informações básicas para continuar.',
      cta: 'Preencher Dados',
      rota: '/onboarding?etapa=1',
      tempoEstimado: '~2min',
      prioridade: 'alta',
      icone: 'User',
    };
  }

  if (!objetivoPrincipalOnb) {
    return {
      etapa: 2,
      titulo: 'Conte-nos sobre Você',
      descricao: 'Uma breve triagem para entender suas necessidades.',
      cta: 'Continuar',
      rota: '/onboarding?etapa=2',
      tempoEstimado: '~1min',
      prioridade: 'alta',
      icone: 'Stethoscope',
    };
  }

  const docsObrigatorios = DOCUMENTOS_OBRIGATORIOS[perfilOnboarding];
  const docsFaltantes: TipoDocumento[] = [];
  const docsRejeitados: TipoDocumento[] = [];
  const docsEmValidacao: TipoDocumento[] = [];

  for (const tipoDoc of docsObrigatorios) {
    const doc = documentos.find(d => d.tipo === tipoDoc);
    if (!doc || doc.status === 'PENDENTE') {
      docsFaltantes.push(tipoDoc);
    } else if (doc.status === 'REJEITADO') {
      docsRejeitados.push(tipoDoc);
    } else if (doc.status === 'ENVIADO' || doc.status === 'EM_VALIDACAO') {
      docsEmValidacao.push(tipoDoc);
    } else if (doc.status === 'EXPIRADO') {
      docsFaltantes.push(tipoDoc);
    }
  }

  if (docsRejeitados.length > 0) {
    const tipoDoc = docsRejeitados[0];
    return {
      etapa: 3,
      titulo: 'Documento Rejeitado',
      descricao: `Seu ${getNomeDocumento(tipoDoc)} foi rejeitado. Por favor, reenvie.`,
      cta: 'Reenviar Documento',
      rota: '/onboarding?etapa=3',
      prioridade: 'alta',
      icone: 'AlertCircle',
    };
  }

  if (docsFaltantes.length > 0) {
    const tipoDoc = docsFaltantes[0];
    return {
      etapa: 3,
      titulo: `Enviar ${getNomeDocumento(tipoDoc)}`,
      descricao: getDescricaoDocumento(tipoDoc),
      cta: 'Enviar Documento',
      rota: '/onboarding?etapa=3',
      tempoEstimado: '~1min',
      prioridade: 'alta',
      icone: 'Upload',
    };
  }

  if (docsEmValidacao.length > 0) {
    return {
      etapa: 3,
      titulo: 'Documentos em Análise',
      descricao: 'Seus documentos estão sendo analisados. Você será notificado em breve.',
      cta: 'Ver Status',
      rota: '/minha-pasta',
      prioridade: 'media',
      icone: 'Clock',
    };
  }

  const assinaturaAtiva = assinaturas.find(a => a.status === 'ATIVA');
  if (!assinaturaAtiva && statusOnboarding !== 'ASSOCIADO_ATIVO') {
    return {
      etapa: 4,
      titulo: 'Ativar Associação',
      descricao: 'Escolha seu plano de contribuição para se tornar um associado ativo.',
      cta: 'Escolher Plano',
      rota: '/onboarding?etapa=4',
      tempoEstimado: '~2min',
      prioridade: 'alta',
      icone: 'CreditCard',
    };
  }

  if (statusOnboarding === 'ASSOCIADO_ATIVO') {
    const prescricao = documentos.find(d => d.tipo === 'PRESCRICAO' && d.status === 'APROVADO');
    if (prescricao?.dataValidade) {
      const diasParaVencer = Math.ceil((new Date(prescricao.dataValidade).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (diasParaVencer <= 30 && diasParaVencer > 0) {
        return {
          etapa: 5,
          titulo: 'Prescrição Vencendo',
          descricao: `Sua prescrição vence em ${diasParaVencer} dias. Agende uma renovação.`,
          cta: 'Agendar Consulta',
          rota: '/marketplace',
          prioridade: diasParaVencer <= 7 ? 'alta' : 'media',
          icone: 'Calendar',
        };
      }
    }

    return {
      etapa: 99,
      titulo: 'Tudo Certo!',
      descricao: 'Sua associação está ativa. Explore os benefícios disponíveis.',
      cta: 'Ver Benefícios',
      rota: '/dashboard',
      prioridade: 'baixa',
      icone: 'CheckCircle',
    };
  }

  return {
    etapa: 0,
    titulo: 'Continuar Cadastro',
    descricao: 'Continue de onde parou.',
    cta: 'Continuar',
    rota: '/onboarding',
    prioridade: 'alta',
    icone: 'ArrowRight',
  };
}

function getNomeDocumento(tipo: TipoDocumento): string {
  const nomes: Record<TipoDocumento, string> = {
    IDENTIDADE_FRENTE: 'Documento de Identidade (Frente)',
    IDENTIDADE_VERSO: 'Documento de Identidade (Verso)',
    SELFIE: 'Selfie com Documento',
    COMPROVANTE_ENDERECO: 'Comprovante de Endereço',
    PRESCRICAO: 'Prescrição Médica',
    LAUDO_MEDICO: 'Laudo Médico',
    AUTORIZACAO_ANVISA: 'Autorização ANVISA',
    OUTRO: 'Documento',
  };
  return nomes[tipo] || 'Documento';
}

function getDescricaoDocumento(tipo: TipoDocumento): string {
  const descricoes: Record<TipoDocumento, string> = {
    IDENTIDADE_FRENTE: 'Envie a frente do seu RG ou CNH.',
    IDENTIDADE_VERSO: 'Envie o verso do seu documento.',
    SELFIE: 'Tire uma selfie segurando seu documento.',
    COMPROVANTE_ENDERECO: 'Envie um comprovante de endereço recente.',
    PRESCRICAO: 'Envie sua prescrição médica de cannabis.',
    LAUDO_MEDICO: 'Envie seu laudo ou exames médicos.',
    AUTORIZACAO_ANVISA: 'Envie sua autorização de importação da ANVISA.',
    OUTRO: 'Envie o documento solicitado.',
  };
  return descricoes[tipo] || 'Envie o documento.';
}

export function gerarNumeroAssociado(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 8; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ABR-${codigo}`;
}

export function gerarQRToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function calcularValidadeCarteirinha(): Date {
  const agora = new Date();
  agora.setFullYear(agora.getFullYear() + 1);
  return agora;
}

export const OBJETIVOS_ONBOARDING = [
  { id: 'dor_cronica', label: 'Tratamento de dor crônica' },
  { id: 'ansiedade', label: 'Ansiedade e transtornos de humor' },
  { id: 'epilepsia', label: 'Epilepsia e convulsões' },
  { id: 'insonia', label: 'Insônia e distúrbios do sono' },
  { id: 'cancer', label: 'Suporte oncológico' },
  { id: 'parkinson', label: 'Parkinson ou doenças neurológicas' },
  { id: 'autismo', label: 'Transtorno do Espectro Autista' },
  { id: 'qualidade_vida', label: 'Melhora da qualidade de vida' },
  { id: 'outro', label: 'Outro' },
];

export const SINTOMAS_ONBOARDING = [
  { id: 'dor', label: 'Dor' },
  { id: 'ansiedade', label: 'Ansiedade' },
  { id: 'depressao', label: 'Depressão' },
  { id: 'insonia', label: 'Insônia' },
  { id: 'nausea', label: 'Náusea' },
  { id: 'perda_apetite', label: 'Perda de apetite' },
  { id: 'espasmos', label: 'Espasmos musculares' },
  { id: 'convulsoes', label: 'Convulsões' },
  { id: 'inflamacao', label: 'Inflamação' },
  { id: 'fadiga', label: 'Fadiga' },
];
