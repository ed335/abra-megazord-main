// Sistema de Permissões por Cargo
// Define quais permissões cada cargo tem por padrão

export type CargoAdmin = 
  | 'SUPER_ADMIN'
  | 'ADMINISTRADOR'
  | 'GERENTE'
  | 'ATENDENTE'
  | 'FINANCEIRO'
  | 'MARKETING';

export type PermissaoAdmin =
  | 'VER_ASSOCIADOS'
  | 'EDITAR_ASSOCIADOS'
  | 'DELETAR_ASSOCIADOS'
  | 'VER_MEDICOS'
  | 'APROVAR_MEDICOS'
  | 'EDITAR_MEDICOS'
  | 'VER_AGENDAMENTOS'
  | 'GERENCIAR_AGENDAMENTOS'
  | 'VER_PAGAMENTOS'
  | 'GERENCIAR_PAGAMENTOS'
  | 'VER_PLANOS'
  | 'GERENCIAR_PLANOS'
  | 'ENVIAR_WHATSAPP'
  | 'GERENCIAR_TEMPLATES'
  | 'VER_EQUIPE'
  | 'GERENCIAR_EQUIPE'
  | 'VER_LOGS'
  | 'CONFIGURACOES_SISTEMA';

// Permissões padrão por cargo
export const PERMISSOES_POR_CARGO: Record<CargoAdmin, PermissaoAdmin[]> = {
  SUPER_ADMIN: [
    'VER_ASSOCIADOS', 'EDITAR_ASSOCIADOS', 'DELETAR_ASSOCIADOS',
    'VER_MEDICOS', 'APROVAR_MEDICOS', 'EDITAR_MEDICOS',
    'VER_AGENDAMENTOS', 'GERENCIAR_AGENDAMENTOS',
    'VER_PAGAMENTOS', 'GERENCIAR_PAGAMENTOS',
    'VER_PLANOS', 'GERENCIAR_PLANOS',
    'ENVIAR_WHATSAPP', 'GERENCIAR_TEMPLATES',
    'VER_EQUIPE', 'GERENCIAR_EQUIPE',
    'VER_LOGS', 'CONFIGURACOES_SISTEMA',
  ],
  ADMINISTRADOR: [
    'VER_ASSOCIADOS', 'EDITAR_ASSOCIADOS',
    'VER_MEDICOS', 'APROVAR_MEDICOS', 'EDITAR_MEDICOS',
    'VER_AGENDAMENTOS', 'GERENCIAR_AGENDAMENTOS',
    'VER_PAGAMENTOS', 'GERENCIAR_PAGAMENTOS',
    'VER_PLANOS', 'GERENCIAR_PLANOS',
    'ENVIAR_WHATSAPP', 'GERENCIAR_TEMPLATES',
    'VER_EQUIPE',
    'VER_LOGS',
  ],
  GERENTE: [
    'VER_ASSOCIADOS', 'EDITAR_ASSOCIADOS',
    'VER_MEDICOS', 'EDITAR_MEDICOS',
    'VER_AGENDAMENTOS', 'GERENCIAR_AGENDAMENTOS',
    'VER_PAGAMENTOS',
    'VER_PLANOS',
    'ENVIAR_WHATSAPP',
    'VER_EQUIPE',
  ],
  ATENDENTE: [
    'VER_ASSOCIADOS',
    'VER_MEDICOS',
    'VER_AGENDAMENTOS', 'GERENCIAR_AGENDAMENTOS',
    'ENVIAR_WHATSAPP',
  ],
  FINANCEIRO: [
    'VER_ASSOCIADOS',
    'VER_PAGAMENTOS', 'GERENCIAR_PAGAMENTOS',
    'VER_PLANOS', 'GERENCIAR_PLANOS',
  ],
  MARKETING: [
    'VER_ASSOCIADOS',
    'ENVIAR_WHATSAPP', 'GERENCIAR_TEMPLATES',
  ],
};

// Descrições dos cargos
export const DESCRICAO_CARGOS: Record<CargoAdmin, { nome: string; descricao: string }> = {
  SUPER_ADMIN: {
    nome: 'Super Administrador',
    descricao: 'Acesso total ao sistema. Pode gerenciar todos os aspectos da plataforma.',
  },
  ADMINISTRADOR: {
    nome: 'Administrador',
    descricao: 'Gerencia a maioria das funções do sistema, exceto configurações críticas.',
  },
  GERENTE: {
    nome: 'Gerente',
    descricao: 'Gerencia equipe e operações do dia a dia.',
  },
  ATENDENTE: {
    nome: 'Atendente',
    descricao: 'Suporte e atendimento ao cliente. Acesso limitado.',
  },
  FINANCEIRO: {
    nome: 'Financeiro',
    descricao: 'Acesso a pagamentos, assinaturas e planos.',
  },
  MARKETING: {
    nome: 'Marketing',
    descricao: 'Gerencia comunicações e campanhas de WhatsApp.',
  },
};

// Descrições das permissões
export const DESCRICAO_PERMISSOES: Record<PermissaoAdmin, { nome: string; categoria: string }> = {
  VER_ASSOCIADOS: { nome: 'Visualizar Associados', categoria: 'Associados' },
  EDITAR_ASSOCIADOS: { nome: 'Editar Associados', categoria: 'Associados' },
  DELETAR_ASSOCIADOS: { nome: 'Excluir Associados', categoria: 'Associados' },
  VER_MEDICOS: { nome: 'Visualizar Médicos', categoria: 'Médicos' },
  APROVAR_MEDICOS: { nome: 'Aprovar Médicos', categoria: 'Médicos' },
  EDITAR_MEDICOS: { nome: 'Editar Médicos', categoria: 'Médicos' },
  VER_AGENDAMENTOS: { nome: 'Visualizar Agendamentos', categoria: 'Agendamentos' },
  GERENCIAR_AGENDAMENTOS: { nome: 'Gerenciar Agendamentos', categoria: 'Agendamentos' },
  VER_PAGAMENTOS: { nome: 'Visualizar Pagamentos', categoria: 'Financeiro' },
  GERENCIAR_PAGAMENTOS: { nome: 'Gerenciar Pagamentos', categoria: 'Financeiro' },
  VER_PLANOS: { nome: 'Visualizar Planos', categoria: 'Financeiro' },
  GERENCIAR_PLANOS: { nome: 'Gerenciar Planos', categoria: 'Financeiro' },
  ENVIAR_WHATSAPP: { nome: 'Enviar WhatsApp', categoria: 'Comunicações' },
  GERENCIAR_TEMPLATES: { nome: 'Gerenciar Templates', categoria: 'Comunicações' },
  VER_EQUIPE: { nome: 'Visualizar Equipe', categoria: 'Equipe' },
  GERENCIAR_EQUIPE: { nome: 'Gerenciar Equipe', categoria: 'Equipe' },
  VER_LOGS: { nome: 'Visualizar Logs', categoria: 'Sistema' },
  CONFIGURACOES_SISTEMA: { nome: 'Configurações do Sistema', categoria: 'Sistema' },
};

// Verifica se um admin tem uma permissão específica
export function temPermissao(
  cargo: CargoAdmin,
  permissoesCustom: PermissaoAdmin[],
  permissaoNecessaria: PermissaoAdmin
): boolean {
  // Super Admin sempre tem todas as permissões
  if (cargo === 'SUPER_ADMIN') return true;
  
  // Verifica permissões do cargo
  const permissoesCargo = PERMISSOES_POR_CARGO[cargo] || [];
  if (permissoesCargo.includes(permissaoNecessaria)) return true;
  
  // Verifica permissões customizadas
  if (permissoesCustom.includes(permissaoNecessaria)) return true;
  
  return false;
}

// Retorna todas as permissões de um admin (cargo + custom)
export function obterTodasPermissoes(
  cargo: CargoAdmin,
  permissoesCustom: PermissaoAdmin[]
): PermissaoAdmin[] {
  if (cargo === 'SUPER_ADMIN') {
    return Object.values(PERMISSOES_POR_CARGO.SUPER_ADMIN);
  }
  
  const permissoesCargo = PERMISSOES_POR_CARGO[cargo] || [];
  const todas = new Set([...permissoesCargo, ...permissoesCustom]);
  return Array.from(todas);
}

// Lista de todas as permissões agrupadas por categoria
export function obterPermissoesAgrupadas(): Record<string, { key: PermissaoAdmin; nome: string }[]> {
  const agrupadas: Record<string, { key: PermissaoAdmin; nome: string }[]> = {};
  
  for (const [key, value] of Object.entries(DESCRICAO_PERMISSOES)) {
    if (!agrupadas[value.categoria]) {
      agrupadas[value.categoria] = [];
    }
    agrupadas[value.categoria].push({
      key: key as PermissaoAdmin,
      nome: value.nome,
    });
  }
  
  return agrupadas;
}
