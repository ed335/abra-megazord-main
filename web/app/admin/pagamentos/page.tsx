'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, fetchWithAdminAuth } from '@/lib/admin-auth-client';
import { 
  Loader2, 
  DollarSign, 
  TrendingUp, 
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

interface PagamentoAdmin {
  id: string;
  tipo: string;
  valor: number;
  status: string;
  clienteNome: string;
  clienteEmail: string;
  pagoEm: string | null;
  criadoEm: string;
}

interface Stats {
  totalRecebido: number;
  totalPendente: number;
  assinaturasAtivas: number;
  pagamentosHoje: number;
}

export default function AdminPagamentosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pagamentos, setPagamentos] = useState<PagamentoAdmin[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const data = await fetchWithAdminAuth<{ 
        pagamentos: PagamentoAdmin[]; 
        stats: Stats 
      }>('/api/admin/pagamentos');
      
      setPagamentos(data.pagamentos || []);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PAGO: 'bg-green-100 text-green-700',
      PENDENTE: 'bg-yellow-100 text-yellow-700',
      PROCESSANDO: 'bg-blue-100 text-blue-700',
      FALHOU: 'bg-red-100 text-red-700',
      EXPIRADO: 'bg-gray-100 text-gray-700',
      REEMBOLSADO: 'bg-purple-100 text-purple-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      MENSALIDADE: 'Mensalidade',
      CONSULTA: 'Consulta',
      PRIMEIRA_CONSULTA: 'Primeira Consulta',
    };
    return labels[tipo] || tipo;
  };

  const filteredPagamentos = pagamentos.filter(p => {
    if (filtroStatus && p.status !== filtroStatus) return false;
    if (busca) {
      const search = busca.toLowerCase();
      return (
        p.clienteNome?.toLowerCase().includes(search) ||
        p.clienteEmail?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <AdminLayout title="Pagamentos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-verde-oliva animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pagamentos">
      <div className="space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Recebido</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalRecebido)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendente</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.totalPendente)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Assinaturas Ativas</p>
                  <p className="text-lg font-bold text-gray-900">{stats.assinaturasAtivas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pagamentos Hoje</p>
                  <p className="text-lg font-bold text-gray-900">{stats.pagamentosHoje}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
              >
                <option value="">Todos os status</option>
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PROCESSANDO">Processando</option>
                <option value="FALHOU">Falhou</option>
                <option value="EXPIRADO">Expirado</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPagamentos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhum pagamento encontrado
                    </td>
                  </tr>
                ) : (
                  filteredPagamentos.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.clienteNome || '-'}</p>
                          <p className="text-xs text-gray-500">{p.clienteEmail || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getTipoLabel(p.tipo)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(p.valor)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(p.status)}`}>
                          {p.status === 'PAGO' && <CheckCircle2 className="w-3 h-3" />}
                          {p.status === 'FALHOU' && <XCircle className="w-3 h-3" />}
                          {p.status === 'PENDENTE' && <Clock className="w-3 h-3" />}
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(p.pagoEm || p.criadoEm)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
