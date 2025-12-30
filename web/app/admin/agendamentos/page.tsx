'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Video,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Edit,
  Trash2,
  PlayCircle
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

type Paciente = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  patologiaCID?: string;
};

type Agendamento = {
  id: string;
  pacienteId: string;
  paciente: Paciente;
  dataHora: string;
  duracao: number;
  tipo: string;
  status: string;
  motivo?: string;
  observacoes?: string;
  linkVideo?: string;
  criadoEm: string;
};

type Stats = {
  resumo: {
    total: number;
    hoje: number;
    semana: number;
    mes: number;
  };
  porStatus: { status: string; label: string; count: number }[];
  porTipo: { tipo: string; label: string; count: number }[];
  proximosAgendamentos: Agendamento[];
};

const statusLabels: Record<string, string> = {
  AGENDADO: 'Agendado',
  CONFIRMADO: 'Confirmado',
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  FALTOU: 'Faltou'
};

const statusColors: Record<string, string> = {
  AGENDADO: 'bg-blue-100 text-blue-800',
  CONFIRMADO: 'bg-green-100 text-green-800',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDO: 'bg-gray-100 text-gray-800',
  CANCELADO: 'bg-red-100 text-red-800',
  FALTOU: 'bg-orange-100 text-orange-800'
};

const tipoLabels: Record<string, string> = {
  PRIMEIRA_CONSULTA: 'Primeira Consulta',
  RETORNO: 'Retorno',
  ACOMPANHAMENTO: 'Acompanhamento',
  URGENTE: 'Urgente'
};

export default function AgendamentosPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    dataInicio: '',
    dataFim: ''
  });
  
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [novoAgendamento, setNovoAgendamento] = useState({
    pacienteId: '',
    dataHora: '',
    duracao: 30,
    tipo: 'PRIMEIRA_CONSULTA',
    motivo: '',
    observacoes: '',
    linkVideo: ''
  });
  const [editAgendamento, setEditAgendamento] = useState<Agendamento | null>(null);
  const [editForm, setEditForm] = useState({
    dataHora: '',
    duracao: 30,
    tipo: 'PRIMEIRA_CONSULTA',
    status: 'AGENDADO',
    motivo: '',
    observacoes: '',
    linkVideo: ''
  });
  
  const router = useRouter();

  const fetchStats = useCallback(async () => {
    const token = getToken();
    try {
      const response = await fetch('/api/admin/agendamentos/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  }, [router]);

  const fetchAgendamentos = useCallback(async () => {
    setLoading(true);
    const token = getToken();
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20'
    });
    
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    
    try {
      const response = await fetch(`/api/admin/agendamentos?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      setAgendamentos(data.agendamentos);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError('Erro ao buscar agendamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filtros, router]);

  const fetchPacientes = async () => {
    const token = getToken();
    try {
      const response = await fetch('/api/admin/associados?limit=1000', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPacientes(data.associados || []);
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAgendamentos();
  }, [fetchStats, fetchAgendamentos]);

  const handleNovoAgendamento = async () => {
    if (!novoAgendamento.pacienteId || !novoAgendamento.dataHora) {
      setError('Selecione o paciente e a data/hora');
      return;
    }
    
    const token = getToken();
    try {
      const response = await fetch('/api/admin/agendamentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(novoAgendamento)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar agendamento');
      }
      
      setShowNovoModal(false);
      setNovoAgendamento({
        pacienteId: '',
        dataHora: '',
        duracao: 30,
        tipo: 'PRIMEIRA_CONSULTA',
        motivo: '',
        observacoes: '',
        linkVideo: ''
      });
      fetchAgendamentos();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    const token = getToken();
    try {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }
      
      fetchAgendamentos();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleOpenEdit = (ag: Agendamento) => {
    setEditAgendamento(ag);
    const dataHora = new Date(ag.dataHora);
    const year = dataHora.getFullYear();
    const month = String(dataHora.getMonth() + 1).padStart(2, '0');
    const day = String(dataHora.getDate()).padStart(2, '0');
    const hours = String(dataHora.getHours()).padStart(2, '0');
    const minutes = String(dataHora.getMinutes()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    setEditForm({
      dataHora: localDateTime,
      duracao: ag.duracao,
      tipo: ag.tipo,
      status: ag.status,
      motivo: ag.motivo || '',
      observacoes: ag.observacoes || '',
      linkVideo: ag.linkVideo || ''
    });
    setShowEditModal(true);
  };

  const handleEditAgendamento = async () => {
    if (!editAgendamento) return;
    
    const token = getToken();
    try {
      const response = await fetch(`/api/admin/agendamentos/${editAgendamento.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atualizar agendamento');
      }
      
      setShowEditModal(false);
      setEditAgendamento(null);
      fetchAgendamentos();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  const handleDeleteAgendamento = async (id: string) => {
    const token = getToken();
    try {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao excluir agendamento');
      }
      
      setShowDeleteConfirm(null);
      fetchAgendamentos();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout 
      title="Agendamentos"
      actions={
        <button
          onClick={() => {
            fetchPacientes();
            setShowNovoModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-escuro transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Novo Agendamento</span>
        </button>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cinza-claro">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-verde-claro/20 rounded-lg">
                  <Calendar className="text-verde-oliva" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cinza-escuro">{stats.resumo.total}</p>
                  <p className="text-xs text-cinza-medio">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cinza-claro">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cinza-escuro">{stats.resumo.hoje}</p>
                  <p className="text-xs text-cinza-medio">Hoje</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cinza-claro">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cinza-escuro">{stats.resumo.semana}</p>
                  <p className="text-xs text-cinza-medio">Esta Semana</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cinza-claro">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-cinza-escuro">{stats.resumo.mes}</p>
                  <p className="text-xs text-cinza-medio">Este Mês</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-cinza-claro mb-6">
          <div className="p-4 border-b border-cinza-claro">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-cinza-medio" />
                <span className="text-sm font-medium text-cinza-escuro">Filtros:</span>
              </div>
              
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
              >
                <option value="">Todos os Status</option>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
              >
                <option value="">Todos os Tipos</option>
                {Object.entries(tipoLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                placeholder="Data início"
              />
              
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                placeholder="Data fim"
              />
              
              <button
                onClick={() => { setPage(1); fetchAgendamentos(); }}
                className="px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-escuro transition-colors flex items-center gap-2"
              >
                <Search size={16} />
                Buscar
              </button>
              
              <button
                onClick={() => {
                  setFiltros({ status: '', tipo: '', dataInicio: '', dataFim: '' });
                  setPage(1);
                }}
                className="px-4 py-2 border border-cinza-claro text-cinza-escuro rounded-lg hover:bg-cinza-muito-claro transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Limpar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-verde-oliva mx-auto"></div>
              <p className="mt-4 text-cinza-medio">Carregando...</p>
            </div>
          ) : agendamentos.length === 0 ? (
            <div className="p-8 text-center text-cinza-medio">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cinza-muito-claro">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cinza-medio uppercase tracking-wider">Data/Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cinza-medio uppercase tracking-wider">Paciente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cinza-medio uppercase tracking-wider">Tipo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cinza-medio uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-cinza-medio uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cinza-claro">
                  {agendamentos.map((ag) => (
                    <tr key={ag.id} className="hover:bg-cinza-muito-claro/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-cinza-medio" />
                          <div>
                            <p className="font-medium text-cinza-escuro">{formatDate(ag.dataHora)}</p>
                            <p className="text-sm text-cinza-medio">{formatTime(ag.dataHora)} ({ag.duracao}min)</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-cinza-medio" />
                          <div>
                            <p className="font-medium text-cinza-escuro">{ag.paciente.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-cinza-medio">
                              <Phone size={12} />
                              {ag.paciente.whatsapp}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-cinza-escuro">
                          {tipoLabels[ag.tipo] || ag.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColors[ag.status] || 'bg-gray-100 text-gray-800'}`}>
                          {statusLabels[ag.status] || ag.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {ag.status === 'AGENDADO' && (
                            <button
                              onClick={() => handleUpdateStatus(ag.id, 'CONFIRMADO')}
                              className="p-1 text-green-600 hover:bg-green-100 rounded"
                              title="Confirmar"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          {(ag.status === 'AGENDADO' || ag.status === 'CONFIRMADO') && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(ag.id, 'CONCLUIDO')}
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                title="Marcar como Concluído"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(ag.id, 'CANCELADO')}
                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                title="Cancelar"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                          {ag.status === 'CONFIRMADO' && (
                            <Link
                              href="/medico/consultas"
                              className="p-1 text-verde-claro hover:bg-verde-claro/10 rounded"
                              title="Iniciar Teleconsulta"
                            >
                              <PlayCircle size={18} />
                            </Link>
                          )}
                          {ag.status === 'EM_ANDAMENTO' && (
                            <Link
                              href="/medico/consultas"
                              className="p-1 text-verde-claro hover:bg-verde-claro/10 rounded animate-pulse"
                              title="Retomar Teleconsulta"
                            >
                              <Video size={18} />
                            </Link>
                          )}
                          {ag.linkVideo && ag.status !== 'CONFIRMADO' && ag.status !== 'EM_ANDAMENTO' && (
                            <a
                              href={ag.linkVideo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                              title="Link da Videochamada"
                            >
                              <Video size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(ag)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(ag.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-cinza-claro flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-cinza-muito-claro disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-cinza-medio">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-cinza-muito-claro disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {showNovoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cinza-escuro">Novo Agendamento</h2>
              <button onClick={() => setShowNovoModal(false)} className="text-cinza-medio hover:text-cinza-escuro">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Paciente *</label>
                <select
                  value={novoAgendamento.pacienteId}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, pacienteId: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                >
                  <option value="">Selecione o paciente</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} - {p.whatsapp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Data e Hora *</label>
                <input
                  type="datetime-local"
                  value={novoAgendamento.dataHora}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, dataHora: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Duração (min)</label>
                  <select
                    value={novoAgendamento.duracao}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, duracao: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Tipo</label>
                  <select
                    value={novoAgendamento.tipo}
                    onChange={(e) => setNovoAgendamento({ ...novoAgendamento, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  >
                    {Object.entries(tipoLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Motivo</label>
                <input
                  type="text"
                  value={novoAgendamento.motivo}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  placeholder="Motivo da consulta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Link da Videochamada</label>
                <input
                  type="url"
                  value={novoAgendamento.linkVideo}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, linkVideo: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Observações</label>
                <textarea
                  value={novoAgendamento.observacoes}
                  onChange={(e) => setNovoAgendamento({ ...novoAgendamento, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowNovoModal(false)}
                className="flex-1 px-4 py-2 border border-cinza-claro text-cinza-escuro rounded-lg hover:bg-cinza-muito-claro transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleNovoAgendamento}
                className="flex-1 px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-escuro transition-colors"
              >
                Criar Agendamento
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editAgendamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cinza-escuro">Editar Agendamento</h2>
              <button onClick={() => setShowEditModal(false)} className="text-cinza-medio hover:text-cinza-escuro">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 p-3 bg-cinza-muito-claro rounded-lg">
              <p className="font-medium text-cinza-escuro">{editAgendamento.paciente.nome}</p>
              <p className="text-sm text-cinza-medio">{editAgendamento.paciente.whatsapp}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Data e Hora</label>
                <input
                  type="datetime-local"
                  value={editForm.dataHora}
                  onChange={(e) => setEditForm({ ...editForm, dataHora: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Duração (min)</label>
                  <select
                    value={editForm.duracao}
                    onChange={(e) => setEditForm({ ...editForm, duracao: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Tipo</label>
                  <select
                    value={editForm.tipo}
                    onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  >
                    {Object.entries(tipoLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Motivo</label>
                <input
                  type="text"
                  value={editForm.motivo}
                  onChange={(e) => setEditForm({ ...editForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  placeholder="Motivo da consulta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Link da Videochamada</label>
                <input
                  type="url"
                  value={editForm.linkVideo}
                  onChange={(e) => setEditForm({ ...editForm, linkVideo: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cinza-escuro mb-1">Observações</label>
                <textarea
                  value={editForm.observacoes}
                  onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva focus:border-verde-oliva"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-cinza-claro text-cinza-escuro rounded-lg hover:bg-cinza-muito-claro transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditAgendamento}
                className="flex-1 px-4 py-2 bg-verde-oliva text-white rounded-lg hover:bg-verde-escuro transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-cinza-escuro mb-2">Excluir Agendamento?</h2>
              <p className="text-cinza-medio mb-6">
                Esta ação não pode ser desfeita. O agendamento será permanentemente removido.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-cinza-claro text-cinza-escuro rounded-lg hover:bg-cinza-muito-claro transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteAgendamento(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
