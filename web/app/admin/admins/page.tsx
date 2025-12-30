'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { Shield, UserPlus, Trash2, X, Mail, Lock, User } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

type Admin = {
  id: string;
  usuarioId: string;
  permissoes: string[];
  notas: string | null;
  criadoEm: string;
  usuario: {
    id: string;
    email: string;
    ativo: boolean;
    criadoEm: string;
  };
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
  });
  const router = useRouter();

  const fetchAdmins = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/admin/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Erro ao carregar administradores');
      }

      const data = await response.json();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    const token = getToken();

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar administrador');
      }

      setShowCreateModal(false);
      setFormData({ nome: '', email: '', password: '' });
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const token = getToken();

    try {
      const response = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao remover administrador');
      }

      setConfirmDelete(null);
      fetchAdmins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout 
      title="Gerenciar Administradores"
      actions={
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-oliva/90 transition-colors text-sm font-medium"
        >
          <UserPlus size={16} />
          Novo Admin
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-erro/10 border border-erro/30 rounded-lg text-erro">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-xs hover:underline">
              Fechar
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-cinza-claro rounded-2xl shadow-sm p-8 text-center">
            <p className="text-cinza-medio">Carregando...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white border border-cinza-claro rounded-2xl shadow-sm p-8 text-center">
            <p className="text-cinza-medio">Nenhum administrador encontrado.</p>
          </div>
        ) : (
          <div className="bg-white border border-cinza-claro rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cinza-muito-claro">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cinza-escuro uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cinza-escuro uppercase tracking-wider">
                      Data de Criação
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cinza-escuro uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-cinza-escuro uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinza-claro">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-cinza-muito-claro/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                            <Shield size={18} className="text-amber-600" />
                          </div>
                          <div>
                            <p className="font-medium text-cinza-escuro">{admin.usuario.email}</p>
                            {admin.notas && (
                              <p className="text-xs text-cinza-medio">{admin.notas.split(' criado')[0]}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-cinza-escuro">
                        {formatDate(admin.usuario.criadoEm)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin.usuario.ativo
                            ? 'bg-sucesso/20 text-sucesso'
                            : 'bg-erro/20 text-erro'
                        }`}>
                          {admin.usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {confirmDelete === admin.id ? (
                          <div className="flex items-center gap-2 bg-erro/10 rounded px-3 py-1.5">
                            <span className="text-xs text-erro">Confirmar?</span>
                            <button
                              onClick={() => handleDelete(admin.id)}
                              disabled={deletingId === admin.id}
                              className="text-xs text-erro font-medium hover:underline"
                            >
                              {deletingId === admin.id ? '...' : 'Sim'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs text-cinza-medio hover:underline"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(admin.id)}
                            className="p-2 text-cinza-medio hover:text-erro hover:bg-erro/10 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-cinza-claro flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cinza-escuro">Novo Administrador</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-cinza-medio hover:text-cinza-escuro hover:bg-cinza-muito-claro rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-medio" size={18} />
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                      placeholder="Nome do administrador"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-medio" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                      placeholder="admin@abracanm.org.br"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cinza-medio" size={18} />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                      placeholder="Mínimo 8 caracteres"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm text-cinza-medio hover:text-cinza-escuro transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-oliva/90 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    {creating ? 'Criando...' : 'Criar Administrador'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
