import { PrismaClient, StatusAssinatura, StatusOnboarding, PerfilOnboarding, TipoDocumento } from '@prisma/client';

const prisma = new PrismaClient();

interface MigrationStats {
  total: number;
  migrados: number;
  erros: number;
  porStatus: Record<string, number>;
  porPerfil: Record<string, number>;
}

async function determinarPerfilOnboarding(pacienteId: string): Promise<PerfilOnboarding> {
  const documentos = await prisma.documento.findMany({
    where: { pacienteId },
  });

  const temAnvisa = documentos.some(d => d.tipo === TipoDocumento.AUTORIZACAO_ANVISA);
  const temPrescricao = documentos.some(d => d.tipo === TipoDocumento.PRESCRICAO);

  if (temAnvisa) return PerfilOnboarding.ANVISA;
  if (temPrescricao) return PerfilOnboarding.PRESCRICAO;
  return PerfilOnboarding.INICIANTE;
}

async function determinarStatusOnboarding(pacienteId: string): Promise<StatusOnboarding> {
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
  });

  if (!paciente) return StatusOnboarding.LEAD;

  if (paciente.statusOnboarding && paciente.statusOnboarding !== StatusOnboarding.LEAD) {
    return paciente.statusOnboarding;
  }

  const assinaturaAtiva = await prisma.assinatura.findFirst({
    where: {
      pacienteId,
      status: StatusAssinatura.ATIVA,
    },
  });

  const documentos = await prisma.documento.findMany({
    where: { pacienteId },
  });

  const perfil = await determinarPerfilOnboarding(pacienteId);

  const docsRequeridos: Record<PerfilOnboarding, TipoDocumento[]> = {
    [PerfilOnboarding.INICIANTE]: [TipoDocumento.IDENTIDADE_FRENTE],
    [PerfilOnboarding.PRESCRICAO]: [TipoDocumento.IDENTIDADE_FRENTE, TipoDocumento.PRESCRICAO],
    [PerfilOnboarding.ANVISA]: [TipoDocumento.IDENTIDADE_FRENTE, TipoDocumento.PRESCRICAO, TipoDocumento.AUTORIZACAO_ANVISA],
  };

  const tiposRequeridos = docsRequeridos[perfil];
  const docsAprovados = documentos.filter(d => d.status === 'APROVADO').map(d => d.tipo);

  const todosDocsAprovados = tiposRequeridos.every(tipo => docsAprovados.includes(tipo));

  if (todosDocsAprovados && assinaturaAtiva) {
    return StatusOnboarding.ASSOCIADO_ATIVO;
  }

  const temDocsPendentes = documentos.some(d => d.status === 'PENDENTE' || d.status === 'ENVIADO' || d.status === 'EM_VALIDACAO');
  if (temDocsPendentes) {
    return StatusOnboarding.EM_VALIDACAO;
  }

  const temDocsRejeitados = documentos.some(d => d.status === 'REJEITADO');
  if (temDocsRejeitados || documentos.length > 0) {
    return StatusOnboarding.DOCS_PENDENTES;
  }

  const camposPreenchidos = [
    paciente.nome,
    paciente.cpf,
    paciente.telefone,
  ].filter(Boolean).length;

  if (camposPreenchidos >= 2) {
    return StatusOnboarding.DOCS_PENDENTES;
  }

  return StatusOnboarding.LEAD;
}

async function migrarUsuarios(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    total: 0,
    migrados: 0,
    erros: 0,
    porStatus: {},
    porPerfil: {},
  };

  console.log('Iniciando migração de usuários para novo sistema de onboarding...\n');

  const pacientes = await prisma.paciente.findMany({
    select: {
      id: true,
      nome: true,
      statusOnboarding: true,
      perfilOnboarding: true,
    },
  });

  stats.total = pacientes.length;
  console.log(`Total de pacientes encontrados: ${stats.total}\n`);

  for (const paciente of pacientes) {
    try {
      const novoStatus = await determinarStatusOnboarding(paciente.id);
      const novoPerfil = await determinarPerfilOnboarding(paciente.id);

      const onboardingCompleto = novoStatus === 'ASSOCIADO_ATIVO';

      await prisma.paciente.update({
        where: { id: paciente.id },
        data: {
          statusOnboarding: novoStatus,
          perfilOnboarding: novoPerfil,
          onboardingCompleto,
        },
      });

      stats.migrados++;
      stats.porStatus[novoStatus] = (stats.porStatus[novoStatus] || 0) + 1;
      stats.porPerfil[novoPerfil] = (stats.porPerfil[novoPerfil] || 0) + 1;

      if (stats.migrados % 100 === 0) {
        console.log(`Progresso: ${stats.migrados}/${stats.total}`);
      }
    } catch (error) {
      stats.erros++;
      console.error(`Erro ao migrar paciente ${paciente.id}:`, error);
    }
  }

  return stats;
}

async function gerarCarteirinhasParaAtivos(): Promise<number> {
  console.log('\nGerando carteirinhas para associados ativos...\n');

  const pacientesAtivos = await prisma.paciente.findMany({
    where: {
      statusOnboarding: StatusOnboarding.ASSOCIADO_ATIVO,
    },
    select: {
      id: true,
      nome: true,
      numeroAssociado: true,
      perfilOnboarding: true,
    },
  });

  let carteirinhasGeradas = 0;

  for (const paciente of pacientesAtivos) {
    const carteirinhaExistente = await prisma.carteirinha.findFirst({
      where: { pacienteId: paciente.id },
    });

    if (!carteirinhaExistente) {
      const numero = paciente.numeroAssociado || 
        `ABR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const qrToken = `${paciente.id}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8)}`;

      const dataValidade = new Date();
      dataValidade.setFullYear(dataValidade.getFullYear() + 1);

      await prisma.carteirinha.create({
        data: {
          pacienteId: paciente.id,
          numero,
          qrToken,
          nomeExibido: paciente.nome,
          perfilTipo: paciente.perfilOnboarding,
          dataValidade,
          ativo: true,
        },
      });

      if (!paciente.numeroAssociado) {
        await prisma.paciente.update({
          where: { id: paciente.id },
          data: { numeroAssociado: numero },
        });
      }

      carteirinhasGeradas++;
    }
  }

  return carteirinhasGeradas;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SCRIPT DE MIGRAÇÃO - SISTEMA DE ONBOARDING ABRACANM');
  console.log('='.repeat(60));
  console.log();

  try {
    const stats = await migrarUsuarios();

    console.log('\n' + '='.repeat(60));
    console.log('RESULTADOS DA MIGRAÇÃO');
    console.log('='.repeat(60));
    console.log(`Total de pacientes: ${stats.total}`);
    console.log(`Migrados com sucesso: ${stats.migrados}`);
    console.log(`Erros: ${stats.erros}`);
    console.log('\nDistribuição por Status:');
    Object.entries(stats.porStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log('\nDistribuição por Perfil:');
    Object.entries(stats.porPerfil).forEach(([perfil, count]) => {
      console.log(`  ${perfil}: ${count}`);
    });

    const carteirinhas = await gerarCarteirinhasParaAtivos();
    console.log(`\nCarteirinhas geradas: ${carteirinhas}`);

    console.log('\n' + '='.repeat(60));
    console.log('MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Erro fatal durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
