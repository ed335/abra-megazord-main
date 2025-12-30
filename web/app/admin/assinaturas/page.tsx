'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, fetchWithAdminAuth } from '@/lib/admin-auth-client';
import { 
  Loader2, 
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Filter
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

interface Assinatura {
  id: string;
  status: string;
  dataInicio: string | null;
  dataFim: string | null;
  proximaCobranca: string | null;
  criadoEm: string;
  paciente: {
    nome: string;
    email: string;
    whatsapp: string;
  };
  plano: {
    nome: string;
    tipo: string;
  };
}

interface Stats {
  ativas: number;
  pendentes: number;
  canceladas: number;
  expiradas: number;
}

export default function AdminAssinaturasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    
    const loadData = async () => {
      try {
        const params = new URLSearchParams();
        if (filtroStatus) params.set('status', filtroStatus);
        params.set('page', page.toString());
        params.set('limit', '20');

        const data = await fetchWithAdminAuth<{ 
          assinaturas: Assinatura[]; 
          stats: Stats;
          pagination: { totalPages: number };
        }>(`/api/admin/assinaturas?${params}`);
        
        setAssinaturas(data.assinaturas || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error('Erro ao carregar assinaturas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [router, filtroStatus, page]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      ATIVA: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      PENDENTE: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      CANCELADA: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      EXPIRADA: { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle },
      INADIMPLENTE: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertCircle },
    };
    const c = config[status] || config.PENDENTE;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <AdminLayout title="Assinaturas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-verde-oliva animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Assinaturas">
      <div className="space-y-6">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ativas</p>
                  <p className="text-lg font-bold text-gray-900">{stats.ativas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendentes</p>
                  <p className="text-lg font-bold text-gray-900">{stats.pendentes}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Canceladas</p>
                  <p className="text-lg font-bold text-gray-900">{stats.canceladas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiradas</p>
                  <p className="text-lg font-bold text-gray-900">{stats.expiradas}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none"
            >
              <option value="">Todos os status</option>
              <option value="ATIVA">Ativas</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="CANCELADA">Canceladas</option>
              <option value="EXPIRADA">Expiradas</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inicio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {assinaturas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nenhuma assinatura encontrada
                    </td>
                  </tr>
                ) : (
                  assinaturas.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{a.paciente?.nome || '-'}</p>
                          <p className="text-xs text-gray-500">{a.paciente?.email || '-'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{a.plano?.nome || '-'}</p>
                        <p className="text-xs text-gray-500">{a.plano?.tipo || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(a.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(a.dataInicio)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(a.dataFim)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Pagina {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-200 rounded text-sm disabled:opacity-50"
              >
                Proxima
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
