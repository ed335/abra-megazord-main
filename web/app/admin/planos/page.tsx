'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, fetchWithAdminAuth } from '@/lib/admin-auth-client';
import { 
  Loader2, 
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Package
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

interface Plano {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  valorMensalidade: number;
  valorConsulta: number;
  valorPrimeiraConsulta: number;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  totalAssinaturas: number;
}

export default function AdminPlanosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Plano | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'MENSAL',
    valorMensalidade: 39.90,
    valorConsulta: 149.00,
    valorPrimeiraConsulta: 99.00,
    beneficios: '',
    ordem: 0,
  });

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    loadPlanos();
  }, [router]);

  const loadPlanos = async () => {
    try {
      const data = await fetchWithAdminAuth<{ planos: Plano[] }>('/api/admin/planos');
      setPlanos(data.planos || []);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const beneficiosArray = formData.beneficios.split('\n').filter(b => b.trim());
      const payload = {
        ...formData,
        beneficios: beneficiosArray,
      };

      if (editingPlano) {
        await fetchWithAdminAuth(`/api/admin/planos/${editingPlano.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchWithAdminAuth('/api/admin/planos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setShowForm(false);
      setEditingPlano(null);
      resetForm();
      loadPlanos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar plano');
    }
  };

  const handleEdit = (plano: Plano) => {
    setEditingPlano(plano);
    setFormData({
      nome: plano.nome,
      descricao: plano.descricao || '',
      tipo: plano.tipo,
      valorMensalidade: plano.valorMensalidade,
      valorConsulta: plano.valorConsulta,
      valorPrimeiraConsulta: plano.valorPrimeiraConsulta,
      beneficios: plano.beneficios.join('\n'),
      ordem: plano.ordem,
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (plano: Plano) => {
    try {
      await fetchWithAdminAuth(`/api/admin/planos/${plano.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ativo: !plano.ativo }),
      });
      loadPlanos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao alterar status');
    }
  };

  const handleDelete = async (plano: Plano) => {
    if (!confirm(`Excluir o plano "${plano.nome}"? Esta ação não pode ser desfeita.`)) return;
    
    try {
      await fetchWithAdminAuth(`/api/admin/planos/${plano.id}`, {
        method: 'DELETE',
      });
      loadPlanos();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir plano');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'MENSAL',
      valorMensalidade: 39.90,
      valorConsulta: 149.00,
      valorPrimeiraConsulta: 99.00,
      beneficios: '',
      ordem: 0,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      MENSAL: 'Mensal',
      TRIMESTRAL: 'Trimestral',
      ANUAL: 'Anual',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <AdminLayout title="Planos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-verde-oliva animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Planos"
      actions={
        <button
          onClick={() => { resetForm(); setEditingPlano(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-verde-oliva text-white rounded-lg text-sm font-medium hover:bg-verde-oliva/90"
        >
          <Plus className="w-4 h-4" />
          Novo Plano
        </button>
      }
    >
      <div className="space-y-6">
        {showForm && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingPlano ? 'Editar Plano' : 'Novo Plano'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                  >
                    <option value="MENSAL">Mensal</option>
                    <option value="TRIMESTRAL">Trimestral</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <input
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mensalidade</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorMensalidade}
                    onChange={(e) => setFormData({ ...formData, valorMensalidade: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Consulta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorConsulta}
                    onChange={(e) => setFormData({ ...formData, valorConsulta: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor 1a Consulta</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valorPrimeiraConsulta}
                    onChange={(e) => setFormData({ ...formData, valorPrimeiraConsulta: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficios (um por linha)</label>
                <textarea
                  value={formData.beneficios}
                  onChange={(e) => setFormData({ ...formData, beneficios: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
                  placeholder="Acesso a plataforma&#10;Suporte via WhatsApp&#10;Desconto em consultas"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-verde-oliva text-white rounded-lg text-sm font-medium hover:bg-verde-oliva/90"
                >
                  {editingPlano ? 'Salvar Alteracoes' : 'Criar Plano'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingPlano(null); resetForm(); }}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {planos.map((plano) => (
            <div key={plano.id} className={`bg-white rounded-xl border ${plano.ativo ? 'border-gray-200' : 'border-gray-200 opacity-60'} p-6`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${plano.ativo ? 'bg-verde-oliva/10' : 'bg-gray-100'}`}>
                    <Package className={`w-6 h-6 ${plano.ativo ? 'text-verde-oliva' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{plano.nome}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${plano.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {plano.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        {getTipoLabel(plano.tipo)}
                      </span>
                    </div>
                    {plano.descricao && (
                      <p className="text-sm text-gray-500 mt-1">{plano.descricao}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm">
                      <span className="text-gray-600">Mensalidade: <strong>{formatCurrency(plano.valorMensalidade)}</strong></span>
                      <span className="text-gray-600">Consulta: <strong>{formatCurrency(plano.valorConsulta)}</strong></span>
                      <span className="text-gray-600">1a Consulta: <strong>{formatCurrency(plano.valorPrimeiraConsulta)}</strong></span>
                    </div>
                    {plano.beneficios.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {plano.beneficios.map((b, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{plano.totalAssinaturas} assinatura(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(plano)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title={plano.ativo ? 'Desativar' : 'Ativar'}
                  >
                    {plano.ativo ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleEdit(plano)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(plano)}
                    className="p-2 hover:bg-red-50 rounded-lg transition"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {planos.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum plano cadastrado
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
