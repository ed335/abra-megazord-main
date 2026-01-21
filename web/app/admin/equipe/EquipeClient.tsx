'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  Edit2, 
  Trash2, 
  X,
  Check,
  ChevronDown,
  UserCheck,
  UserX,
  Clock,
  Mail,
  AlertCircle,
  Info,
  UserPlus,
  Copy
} from 'lucide-react';
import { DESCRICAO_CARGOS, PERMISSOES_POR_CARGO, obterPermissoesAgrupadas } from '@/lib/permissions';
import type { CargoAdmin, PermissaoAdmin } from '@/lib/permissions';
import { fetchWithAdminAuth } from '@/lib/admin-auth-client';

interface MembroEquipe {
  id: string;
  usuarioId: string;
  cargo: CargoAdmin;
  permissoes: PermissaoAdmin[];
  permissoesCustom: string[];
  nome: string | null;
  setor: string | null;
  notas: string | null;
  ativo: boolean;
  ultimoAcesso: string | null;
  criadoEm: string;
  usuario: {
    nome: string;
    email: string;
    cpf: string;
  };
}

export default function EquipeClient() {
  const [membros, setMembros] = useState<MembroEquipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [filtroCargo, setFiltroCargo] = useState<CargoAdmin | 'todos'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<MembroEquipe | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchMembros();
  }, []);

  const fetchMembros = async () => {
    try {
      setError('');
      const data = await fetchWithAdminAuth<MembroEquipe[]>('/api/admin/equipe');
      setMembros(data);
    } catch (err: any) {
      console.error('Erro ao carregar equipe:', err);
      setError(err.message || 'Erro ao carregar membros da equipe');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAdminAuth(`/api/admin/equipe/${id}`, { method: 'DELETE' });
      setMembros(membros.filter(m => m.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      alert(error.message || 'Erro ao remover membro');
    }
  };

  const handleToggleAtivo = async (membro: MembroEquipe) => {
    try {
      await fetchWithAdminAuth(`/api/admin/equipe/${membro.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: !membro.ativo }),
      });
      setMembros(membros.map(m => 
        m.id === membro.id ? { ...m, ativo: !m.ativo } : m
      ));
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar status');
    }
  };

  const filteredMembros = membros.filter(membro => {
    const matchSearch = 
      membro.usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membro.usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (membro.nome && membro.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchAtivo = 
      filtroAtivo === 'todos' || 
      (filtroAtivo === 'ativos' && membro.ativo) ||
      (filtroAtivo === 'inativos' && !membro.ativo);
    
    const matchCargo = filtroCargo === 'todos' || membro.cargo === filtroCargo;
    
    return matchSearch && matchAtivo && matchCargo;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const cargoBadgeColors: Record<CargoAdmin, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-200',
    ADMINISTRADOR: 'bg-purple-100 text-purple-800 border-purple-200',
    GERENTE: 'bg-blue-100 text-blue-800 border-blue-200',
    ATENDENTE: 'bg-green-100 text-green-800 border-green-200',
    FINANCEIRO: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    MARKETING: 'bg-pink-100 text-pink-800 border-pink-200',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-abracanm-green/10 rounded-xl">
            <Users className="w-6 h-6 text-abracanm-green" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Equipe</h1>
            <p className="text-sm text-gray-500">
              {membros.length} membro{membros.length !== 1 ? 's' : ''} na equipe administrativa
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingMembro(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-abracanm-green text-white rounded-lg hover:bg-abracanm-green-dark transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Adicionar Membro
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Como adicionar um novo administrador</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>1. O usuário deve primeiro se cadastrar no sistema como associado</li>
              <li>2. Clique em "Adicionar Membro" e informe o email do usuário</li>
              <li>3. Selecione o cargo e permissões desejadas</li>
              <li>4. O usuário poderá acessar o painel admin com seu login existente</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-900">Erro</h3>
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={fetchMembros}
                className="mt-2 text-sm text-red-600 underline hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filtroAtivo}
                onChange={(e) => setFiltroAtivo(e.target.value as typeof filtroAtivo)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
              <select
                value={filtroCargo}
                onChange={(e) => setFiltroCargo(e.target.value as typeof filtroCargo)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
              >
                <option value="todos">Todos os cargos</option>
                {Object.entries(DESCRICAO_CARGOS).map(([key, value]) => (
                  <option key={key} value={key}>{value.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-abracanm-green"></div>
          </div>
        ) : filteredMembros.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum membro encontrado</h3>
            <p className="text-gray-500 mb-4">
              {membros.length === 0 
                ? 'Comece adicionando o primeiro membro da equipe administrativa.'
                : 'Nenhum membro corresponde aos filtros selecionados.'}
            </p>
            {membros.length === 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-abracanm-green text-white rounded-lg hover:bg-abracanm-green-dark"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Primeiro Membro
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Último Acesso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembros.map((membro) => (
                  <tr key={membro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {membro.nome || membro.usuario.nome}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {membro.usuario.email}
                        </p>
                        {membro.setor && (
                          <p className="text-xs text-gray-400">{membro.setor}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cargoBadgeColors[membro.cargo]}`}>
                        <Shield className="w-3 h-3" />
                        {DESCRICAO_CARGOS[membro.cargo]?.nome || membro.cargo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {membro.ativo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <UserCheck className="w-3 h-3" />
                          Ativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <UserX className="w-3 h-3" />
                          Inativo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {membro.ultimoAcesso ? (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(membro.ultimoAcesso)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Nunca acessou</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(membro.criadoEm)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleAtivo(membro)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            membro.ativo 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={membro.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {membro.ativo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setEditingMembro(membro);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {deleteConfirm === membro.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(membro.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Confirmar exclusão"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(membro.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-abracanm-green" />
          Descrição dos Cargos
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DESCRICAO_CARGOS).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cargoBadgeColors[key as CargoAdmin]}`}>
                  {value.nome}
                </span>
              </div>
              <p className="text-sm text-gray-600">{value.descricao}</p>
              <details className="mt-2">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Ver permissões ({PERMISSOES_POR_CARGO[key as CargoAdmin]?.length || 0})
                </summary>
                <ul className="mt-2 text-xs text-gray-500 space-y-0.5">
                  {PERMISSOES_POR_CARGO[key as CargoAdmin]?.map(p => (
                    <li key={p}>• {p.replace(/_/g, ' ')}</li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <MembroModal
            membro={editingMembro}
            onClose={() => {
              setModalOpen(false);
              setEditingMembro(null);
            }}
            onSave={() => {
              fetchMembros();
              setModalOpen(false);
              setEditingMembro(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

interface MembroModalProps {
  membro: MembroEquipe | null;
  onClose: () => void;
  onSave: () => void;
}

function MembroModal({ membro, onClose, onSave }: MembroModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPermissoes, setShowPermissoes] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [createdMembro, setCreatedMembro] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    nome: membro?.nome || '',
    cargo: (membro?.cargo || 'ATENDENTE') as CargoAdmin,
    setor: membro?.setor || '',
    notas: membro?.notas || '',
    permissoesCustom: (membro?.permissoesCustom || []) as string[],
  });

  const permissoesAgrupadas = obterPermissoesAgrupadas();
  const permissoesCargo = PERMISSOES_POR_CARGO[formData.cargo] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = membro 
        ? `/api/admin/equipe/${membro.id}` 
        : '/api/admin/equipe';
      
      const method = membro ? 'PUT' : 'POST';
      
      const result = await fetchWithAdminAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      if (!membro) {
        setCreatedMembro(result);
        setStep('success');
      } else {
        onSave();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePermissaoCustom = (permissao: PermissaoAdmin) => {
    if (permissoesCargo.includes(permissao)) return;
    
    setFormData(prev => ({
      ...prev,
      permissoesCustom: prev.permissoesCustom.includes(permissao)
        ? prev.permissoesCustom.filter(p => p !== permissao)
        : [...prev.permissoesCustom, permissao],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (step === 'success' && createdMembro) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Membro Adicionado com Sucesso!
            </h2>
            <p className="text-gray-600 mb-4">
              O usuário agora tem acesso ao painel administrativo.
            </p>

            {createdMembro.emailEnviado ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800">Email de convite enviado com sucesso!</span>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-yellow-800">Email não enviado. Compartilhe as instruções manualmente.</span>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Instruções para o novo administrador:</h3>
              <ol className="text-sm text-gray-600 space-y-2">
                <li className="flex gap-2">
                  <span className="font-medium text-abracanm-green">1.</span>
                  Acessar: <code className="bg-gray-200 px-1 rounded">/admin/login</code>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-abracanm-green">2.</span>
                  Usar o mesmo email e senha do cadastro de associado
                </li>
                <li className="flex gap-2">
                  <span className="font-medium text-abracanm-green">3.</span>
                  Cargo: <span className="font-medium">{DESCRICAO_CARGOS[createdMembro.cargo]?.nome}</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  copyToClipboard(`Você foi adicionado como ${DESCRICAO_CARGOS[createdMembro.cargo]?.nome} na ABRACANM. Acesse o painel admin em /admin/login usando seu email e senha de associado.`);
                  setSuccess('Instruções copiadas!');
                  setTimeout(() => setSuccess(''), 2000);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Copy className="w-4 h-4" />
                Copiar Instruções
              </button>
              <button
                onClick={onSave}
                className="flex-1 px-4 py-2 bg-abracanm-green text-white rounded-lg hover:bg-abracanm-green-dark"
              >
                Concluir
              </button>
            </div>
            {success && (
              <p className="text-sm text-green-600 mt-2">{success}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {membro ? 'Editar Membro' : 'Adicionar Novo Membro'}
              </h2>
              {!membro && (
                <p className="text-sm text-gray-500 mt-1">
                  O usuário deve estar cadastrado como associado no sistema
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {!membro && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do usuário *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
                  placeholder="email@exemplo.com"
                  required={!membro}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Digite o email de um usuário já cadastrado no sistema como associado
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de exibição
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
                placeholder="Nome para exibição (opcional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor/Departamento
              </label>
              <input
                type="text"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
                placeholder="Ex: Atendimento, Comercial"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo *
            </label>
            <select
              value={formData.cargo}
              onChange={(e) => setFormData({ 
                ...formData, 
                cargo: e.target.value as CargoAdmin,
                permissoesCustom: [],
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
            >
              {Object.entries(DESCRICAO_CARGOS).map(([key, value]) => (
                <option key={key} value={key}>{value.nome}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {DESCRICAO_CARGOS[formData.cargo]?.descricao}
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowPermissoes(!showPermissoes)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-abracanm-green"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showPermissoes ? 'rotate-180' : ''}`} />
              Permissões personalizadas (opcional)
            </button>
            
            <AnimatePresence>
              {showPermissoes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
                  <p className="text-xs text-gray-500">
                    Marque permissões extras além das padrão do cargo. Permissões marcadas em cinza já vêm do cargo.
                  </p>
                  {Object.entries(permissoesAgrupadas).map(([categoria, permissoes]) => (
                    <div key={categoria}>
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">{categoria}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {permissoes.map(({ key, nome }) => {
                          const isFromCargo = permissoesCargo.includes(key);
                          const isCustom = formData.permissoesCustom.includes(key);
                          const isActive = isFromCargo || isCustom;
                          
                          return (
                            <label
                              key={key}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                isFromCargo
                                  ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                                  : isCustom
                                    ? 'bg-abracanm-green/10 border-abracanm-green'
                                    : 'border-gray-200 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isActive}
                                disabled={isFromCargo}
                                onChange={() => togglePermissaoCustom(key)}
                                className="rounded border-gray-300 text-abracanm-green focus:ring-abracanm-green disabled:opacity-50"
                              />
                              <span className={`text-sm ${isFromCargo ? 'text-gray-400' : 'text-gray-700'}`}>
                                {nome}
                              </span>
                              {isFromCargo && (
                                <span className="text-xs text-gray-400">(do cargo)</span>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas internas
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green resize-none"
              placeholder="Anotações sobre este membro (visível apenas para admins)..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-abracanm-green text-white rounded-lg hover:bg-abracanm-green-dark transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {membro ? 'Salvar Alterações' : 'Adicionar Membro'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
