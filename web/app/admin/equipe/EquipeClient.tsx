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
  Clock
} from 'lucide-react';
import { DESCRICAO_CARGOS, DESCRICAO_PERMISSOES, PERMISSOES_POR_CARGO, obterPermissoesAgrupadas, temPermissao } from '@/lib/permissions';
import type { CargoAdmin, PermissaoAdmin } from '@/lib/permissions';
import { fetchWithAdminAuth, getAdminToken } from '@/lib/admin-auth-client';

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
      const data = await fetchWithAdminAuth<MembroEquipe[]>('/api/admin/equipe');
      setMembros(data);
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchWithAdminAuth(`/api/admin/equipe/${id}`, { method: 'DELETE' });
      setMembros(membros.filter(m => m.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Erro ao remover membro:', error);
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
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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
            <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
            <p className="text-sm text-gray-500">
              {membros.length} membro{membros.length !== 1 ? 's' : ''} cadastrado{membros.length !== 1 ? 's' : ''}
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
          <Plus className="w-4 h-4" />
          Adicionar Membro
        </button>
      </div>

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
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum membro encontrado</p>
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
                        <p className="text-sm text-gray-500">{membro.usuario.email}</p>
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
  const [showPermissoes, setShowPermissoes] = useState(false);
  
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
      
      await fetchWithAdminAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      onSave();
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
            <h2 className="text-xl font-semibold text-gray-900">
              {membro ? 'Editar Membro' : 'Adicionar Membro'}
            </h2>
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {!membro && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email do usuário
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
                placeholder="email@exemplo.com"
                required={!membro}
              />
              <p className="text-xs text-gray-500 mt-1">
                O usuário deve estar cadastrado no sistema
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome de exibição (opcional)
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green"
                placeholder="Nome para exibição"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor (opcional)
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
              Cargo
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
              Permissões personalizadas
            </button>
            
            <AnimatePresence>
              {showPermissoes && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 space-y-4 overflow-hidden"
                >
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
              Notas (opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green/20 focus:border-abracanm-green resize-none"
              placeholder="Anotações sobre este membro..."
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
              className="px-4 py-2 bg-abracanm-green text-white rounded-lg hover:bg-abracanm-green-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : membro ? 'Salvar Alterações' : 'Adicionar Membro'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
