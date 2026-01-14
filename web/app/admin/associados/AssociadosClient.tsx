/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth-client';
import { 
  FileText, AlertCircle, Clock, Activity, Download, Upload, 
  MessageCircle, Search, X, Edit2, Power, Eye, Image, LogIn, 
  CreditCard, User, Phone, MapPin, Calendar, Heart, ClipboardList, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Plano = {
  id: string;
  nome: string;
  tipo: string;
  valorMensalidade: number;
  ativo: boolean;
};

type PreAnamnese = {
  id: string;
  perfil: string;
  objetivoPrincipal: string;
  gravidade: number;
  tratamentosPrevios: string[];
  comorbidades: string[];
  notas: string;
  preferenciaAcompanhamento: string;
  melhorHorario: string;
  diagnostico: {
    titulo: string;
    resumo: string;
    nivelUrgencia: 'baixa' | 'moderada' | 'alta';
    indicacoes: string[];
    contraindicacoes: string[];
    observacoes: string;
  } | null;
  scorePrioridade: number;
  recomendacoes: string[];
  proximosPasso: string;
  criadoEm: string;
};

type Associado = {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  jaUsaCannabis: boolean;
  patologiaCID: string | null;
  termoAjuizamento: boolean;
  consenteLGPD: boolean;
  criadoEm: string;
  usuarioId: string;
  usuario: {
    ativo: boolean;
    emailVerificado: boolean;
  };
  preAnamnese: PreAnamnese | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Filters = {
  search: string;
  cidade: string;
  estado: string;
  patologia: string;
  status: string;
  temAnamnese: string;
};

const ESTADOS_BR = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];

function getInitials(nome: string): string {
  const parts = nome.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.substring(0, 2).toUpperCase() || 'US';
}

function getAvatarColor(nome: string): string {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-cyan-500'
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function AssociadosClient() {
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: { linha: number; email: string; erro: string }[]; skipped: number } | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    cidade: '',
    estado: '',
    patologia: '',
    status: '',
    temAnamnese: '',
  });
  const router = useRouter();

  const [selectedAssociado, setSelectedAssociado] = useState<Associado | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: '',
    whatsapp: '',
    cpf: '',
    dataNascimento: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    patologiaCID: '',
    jaUsaCannabis: false,
  });

  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsData, setDocsData] = useState<{
    associado: { id: string; nome: string };
    documentos: { tipo: string; url: string; nome: string }[];
  } | null>(null);

  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [selectedPlanoId, setSelectedPlanoId] = useState('');
  const [mesesPlano, setMesesPlano] = useState(1);
  const [atribuindoPlano, setAtribuindoPlano] = useState(false);

  const [showResetSenhaModal, setShowResetSenhaModal] = useState(false);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [resetandoSenha, setResetandoSenha] = useState(false);

  const buildQueryString = useCallback((page: number, currentFilters: Filters) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '20');
    
    if (currentFilters.search) params.set('search', currentFilters.search);
    if (currentFilters.cidade) params.set('cidade', currentFilters.cidade);
    if (currentFilters.estado) params.set('estado', currentFilters.estado);
    if (currentFilters.patologia) params.set('patologia', currentFilters.patologia);
    if (currentFilters.status) params.set('status', currentFilters.status);
    if (currentFilters.temAnamnese) params.set('temAnamnese', currentFilters.temAnamnese);
    
    return params.toString();
  }, []);

  const fetchAssociados = useCallback(async (page: number, currentFilters: Filters = filters) => {
    setLoading(true);
    setError('');

    const token = getAdminToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const queryString = buildQueryString(page, currentFilters);
      const response = await fetch(`/api/admin/associados?${queryString}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Erro ao carregar associados');
      }

      const data = await response.json();
      setAssociados(data.associados);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [router, buildQueryString, filters]);

  useEffect(() => {
    fetchAssociados(currentPage, filters);
  }, [currentPage, fetchAssociados, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAssociados(1, filters);
  };

  const clearFilters = () => {
    const emptyFilters: Filters = {
      search: '',
      cidade: '',
      estado: '',
      patologia: '',
      status: '',
      temAnamnese: '',
    };
    setFilters(emptyFilters);
    setCurrentPage(1);
    fetchAssociados(1, emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatWhatsApp = (phone: string) => {
    const digits = phone?.replace(/\D/g, '') || '';
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  const getWhatsAppLink = (phone: string, nome: string) => {
    const digits = phone?.replace(/\D/g, '') || '';
    const message = encodeURIComponent(`Olá ${nome.split(' ')[0]}, tudo bem? Aqui é da ABRACANM.`);
    return `https://wa.me/55${digits}?text=${message}`;
  };

  const fetchPlanos = async () => {
    const token = getAdminToken();
    try {
      const response = await fetch('/api/admin/planos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPlanos(data.planos.filter((p: Plano) => p.ativo));
      }
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    }
  };

  const handleOpenProfile = (associado: Associado) => {
    setSelectedAssociado(associado);
    setShowProfileModal(true);
  };

  const handleOpenPlanoModal = (associado: Associado) => {
    setSelectedAssociado(associado);
    setSelectedPlanoId('');
    setMesesPlano(1);
    setShowPlanoModal(true);
    if (planos.length === 0) {
      fetchPlanos();
    }
  };

  const handleAtribuirPlano = async () => {
    if (!selectedAssociado || !selectedPlanoId) return;
    
    setAtribuindoPlano(true);
    const token = getAdminToken();
    
    try {
      const response = await fetch(`/api/admin/associados/${selectedAssociado.id}/atribuir-plano`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planoId: selectedPlanoId, meses: mesesPlano }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao atribuir plano');
      }

      const data = await response.json();
      alert(`Plano "${data.assinatura.plano}" atribuído com sucesso até ${new Date(data.assinatura.dataFim).toLocaleDateString('pt-BR')}`);
      setShowPlanoModal(false);
      setSelectedAssociado(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir plano');
    } finally {
      setAtribuindoPlano(false);
    }
  };

  const handleOpenResetSenhaModal = (associado: Associado) => {
    setSelectedAssociado(associado);
    setNovaSenha('');
    setConfirmaSenha('');
    setShowResetSenhaModal(true);
  };

  const handleResetSenha = async () => {
    if (!selectedAssociado) return;
    
    if (novaSenha.length < 8) {
      alert('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (novaSenha !== confirmaSenha) {
      alert('As senhas não coincidem');
      return;
    }

    setResetandoSenha(true);
    const token = getAdminToken();

    try {
      const response = await fetch(`/api/admin/associados/${selectedAssociado.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ novaSenha }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao redefinir senha');
      }

      const data = await response.json();
      alert(data.message);
      setShowResetSenhaModal(false);
      setSelectedAssociado(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao redefinir senha');
    } finally {
      setResetandoSenha(false);
    }
  };

  const handleViewDocs = async (associado: Associado) => {
    setDocsLoading(true);
    setShowDocsModal(true);
    const token = getAdminToken();

    try {
      const response = await fetch(`/api/admin/associados/${associado.id}/documentos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      setDocsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar documentos');
      setShowDocsModal(false);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleEdit = (associado: Associado) => {
    setSelectedAssociado(associado);
    setEditForm({
      nome: associado.nome || '',
      whatsapp: associado.whatsapp || '',
      cpf: (associado as any).cpf || '',
      dataNascimento: (associado as any).dataNascimento ? new Date((associado as any).dataNascimento).toISOString().split('T')[0] : '',
      cep: (associado as any).cep || '',
      rua: (associado as any).rua || '',
      numero: (associado as any).numero || '',
      complemento: (associado as any).complemento || '',
      bairro: (associado as any).bairro || '',
      cidade: associado.cidade || '',
      estado: associado.estado || '',
      patologiaCID: associado.patologiaCID || '',
      jaUsaCannabis: associado.jaUsaCannabis || false,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAssociado) return;
    
    setSaving(true);
    const token = getAdminToken();
    
    try {
      const response = await fetch(`/api/admin/associados/${selectedAssociado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar');
      }

      setShowEditModal(false);
      setSelectedAssociado(null);
      fetchAssociados(currentPage, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (associado: Associado) => {
    setTogglingId(associado.id);
    const token = getAdminToken();
    
    try {
      const response = await fetch(`/api/admin/associados/${associado.id}/toggle-status`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar status');
      }

      fetchAssociados(currentPage, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleImpersonate = async (associado: Associado) => {
    const token = getAdminToken();
    
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: associado.usuarioId }),
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer login como usuário');
      }

      const data = await response.json();
      
      localStorage.setItem('admin_original_token', token || '');
      localStorage.setItem('abracann_token', data.access_token);
      
      alert(`Logado como ${associado.nome}. Para voltar ao admin, faça logout e entre novamente.`);
      
      if (data.user.role === 'PRESCRITOR') {
        router.push('/medico');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login como usuário');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    const token = getAdminToken();
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/admin/associados/export', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `associados_abracanm_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);
    const token = getAdminToken();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/associados/import', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao importar');
      }

      setImportResult(data);
      fetchAssociados(currentPage, filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 70) return 'Alta';
    if (score >= 40) return 'Média';
    return 'Baixa';
  };

  return (
    <main className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM de Associados</h1>
          <p className="text-gray-500 text-sm">Gerencie seus pacientes e acompanhe o progresso</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            {exporting ? 'Exportando...' : 'Exportar'}
          </button>
          <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload size={16} />
            {importing ? 'Importando...' : 'Importar'}
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Buscar por nome, email ou CPF..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
            />
          </div>
          
          <select
            value={filters.estado}
            onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] bg-white"
          >
            <option value="">Todos os estados</option>
            {ESTADOS_BR.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] bg-white"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>

          <select
            value={filters.temAnamnese}
            onChange={(e) => setFilters(prev => ({ ...prev, temAnamnese: e.target.value }))}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] bg-white"
          >
            <option value="">Pré-anamnese</option>
            <option value="sim">Com anamnese</option>
            <option value="nao">Sem anamnese</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#3FA174] text-white rounded-xl hover:bg-[#359966] transition-colors font-medium"
          >
            Buscar
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </form>
      </div>

      {importResult && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600 font-medium">{importResult.success} importado(s)</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">{importResult.skipped} já existente(s)</span>
            <span className="text-gray-400">|</span>
            <span className="text-red-500">{importResult.errors.length} erro(s)</span>
            <button onClick={() => setImportResult(null)} className="ml-auto text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {pagination && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{pagination.total}</span> associados
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1">
              <FileText size={14} className="text-[#3FA174]" />
              {associados.filter(a => a.preAnamnese).length} com pré-anamnese
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#3FA174] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      ) : associados.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum associado encontrado</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {associados.map((associado) => (
              <motion.div
                key={associado.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:border-[#3FA174]/30 transition-all cursor-pointer group"
                onClick={() => handleOpenProfile(associado)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(associado.nome)} flex items-center justify-center text-white font-semibold text-sm`}>
                      {getInitials(associado.nome)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#3FA174] transition-colors">
                        {associado.nome}
                      </h3>
                      <p className="text-xs text-gray-500">{associado.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    associado.usuario.ativo 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {associado.usuario.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  {associado.cidade && associado.estado && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      {associado.cidade}/{associado.estado}
                    </div>
                  )}
                  {associado.patologiaCID && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart size={14} className="text-gray-400" />
                      {associado.patologiaCID}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    Desde {formatDate(associado.criadoEm)}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {associado.preAnamnese ? (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPriorityColor(associado.preAnamnese.scorePrioridade)}`}>
                      <Activity size={14} />
                      <span className="text-xs font-medium">
                        Prioridade {getPriorityLabel(associado.preAnamnese.scorePrioridade)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Aguardando anamnese</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={getWhatsAppLink(associado.whatsapp, associado.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                  <button
                    onClick={() => handleEdit(associado)}
                    className="p-2 text-gray-400 hover:text-[#3FA174] hover:bg-[#3FA174]/10 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleViewDocs(associado)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver documentos"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenPlanoModal(associado)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Atribuir plano"
                  >
                    <CreditCard size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Página {currentPage} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {showProfileModal && selectedAssociado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowProfileModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedAssociado.nome)} flex items-center justify-center text-white font-bold text-xl`}>
                      {getInitials(selectedAssociado.nome)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedAssociado.nome}</h2>
                      <p className="text-gray-500">{selectedAssociado.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedAssociado.usuario.ativo 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                        }`}>
                          {selectedAssociado.usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                        {selectedAssociado.jaUsaCannabis && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600">
                            Usa cannabis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Phone size={14} />
                      WhatsApp
                    </div>
                    <p className="font-medium text-gray-900">{formatWhatsApp(selectedAssociado.whatsapp)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <MapPin size={14} />
                      Localização
                    </div>
                    <p className="font-medium text-gray-900">
                      {selectedAssociado.cidade && selectedAssociado.estado 
                        ? `${selectedAssociado.cidade}/${selectedAssociado.estado}` 
                        : 'Não informado'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Heart size={14} />
                      Patologia (CID)
                    </div>
                    <p className="font-medium text-gray-900">{selectedAssociado.patologiaCID || 'Não informado'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <Calendar size={14} />
                      Cadastro
                    </div>
                    <p className="font-medium text-gray-900">{formatDate(selectedAssociado.criadoEm)}</p>
                  </div>
                </div>

                {selectedAssociado.preAnamnese ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <ClipboardList size={18} className="text-[#3FA174]" />
                        Pré-Anamnese
                      </h3>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Score de Prioridade</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                selectedAssociado.preAnamnese.scorePrioridade >= 70 ? 'bg-red-500' :
                                selectedAssociado.preAnamnese.scorePrioridade >= 40 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${selectedAssociado.preAnamnese.scorePrioridade}%` }}
                            />
                          </div>
                          <span className="font-bold">{selectedAssociado.preAnamnese.scorePrioridade}</span>
                        </div>
                      </div>

                      {selectedAssociado.preAnamnese.diagnostico && (
                        <div className="bg-[#3FA174]/5 border border-[#3FA174]/20 rounded-xl p-4">
                          <h4 className="font-semibold text-[#3FA174] mb-2">
                            {selectedAssociado.preAnamnese.diagnostico.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {selectedAssociado.preAnamnese.diagnostico.resumo}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedAssociado.preAnamnese.diagnostico.nivelUrgencia === 'alta' 
                                ? 'bg-red-100 text-red-700' 
                                : selectedAssociado.preAnamnese.diagnostico.nivelUrgencia === 'moderada'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              Urgência: {selectedAssociado.preAnamnese.diagnostico.nivelUrgencia}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Objetivo Principal</span>
                          <p className="font-medium">{selectedAssociado.preAnamnese.objetivoPrincipal || '-'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Perfil</span>
                          <p className="font-medium">{selectedAssociado.preAnamnese.perfil || '-'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Gravidade</span>
                          <p className="font-medium">{selectedAssociado.preAnamnese.gravidade}/10</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Horário Preferido</span>
                          <p className="font-medium">{selectedAssociado.preAnamnese.melhorHorario || '-'}</p>
                        </div>
                      </div>

                      {selectedAssociado.preAnamnese.comorbidades?.length > 0 && (
                        <div>
                          <span className="text-sm text-gray-500">Comorbidades</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedAssociado.preAnamnese.comorbidades.map((c, i) => (
                              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedAssociado.preAnamnese.notas && (
                        <div>
                          <span className="text-sm text-gray-500">Observações</span>
                          <p className="text-sm text-gray-700 mt-1 bg-gray-50 p-3 rounded-lg">
                            {selectedAssociado.preAnamnese.notas}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl p-6 text-center">
                    <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Pré-anamnese ainda não respondida</p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setShowProfileModal(false); handleEdit(selectedAssociado); }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => { setShowProfileModal(false); handleViewDocs(selectedAssociado); }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-medium"
                  >
                    <Eye size={16} />
                    Docs
                  </button>
                  <button
                    onClick={() => { setShowProfileModal(false); handleOpenPlanoModal(selectedAssociado); }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <CreditCard size={16} />
                    Plano
                  </button>
                  <button
                    onClick={() => { setShowProfileModal(false); handleOpenResetSenhaModal(selectedAssociado); }}
                    className="flex items-center justify-center gap-2 py-3 px-4 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    <Key size={16} />
                    Senha
                  </button>
                  <button
                    onClick={() => handleToggleStatus(selectedAssociado)}
                    disabled={togglingId === selectedAssociado.id}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors text-sm font-medium ${
                      selectedAssociado.usuario.ativo
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    <Power size={16} />
                    {selectedAssociado.usuario.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>

                <div className="flex gap-3">
                  <a
                    href={getWhatsAppLink(selectedAssociado.whatsapp, selectedAssociado.nome)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium"
                  >
                    <MessageCircle size={18} />
                    Enviar WhatsApp
                  </a>
                  <button
                    onClick={() => handleImpersonate(selectedAssociado)}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
                  >
                    <LogIn size={18} />
                    Logar como
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEditModal && selectedAssociado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Editar Associado</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={editForm.cpf}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cpf: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={editForm.cidade}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cidade: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174] bg-white"
                  >
                    <option value="">Selecione</option>
                    {ESTADOS_BR.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patologia (CID)</label>
                <input
                  type="text"
                  value={editForm.patologiaCID}
                  onChange={(e) => setEditForm(prev => ({ ...prev, patologiaCID: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="jaUsaCannabis"
                  checked={editForm.jaUsaCannabis}
                  onChange={(e) => setEditForm(prev => ({ ...prev, jaUsaCannabis: e.target.checked }))}
                  className="w-4 h-4 text-[#3FA174] rounded"
                />
                <label htmlFor="jaUsaCannabis" className="text-sm text-gray-700">Já usa cannabis medicinal</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-6 py-2 bg-[#3FA174] text-white rounded-xl hover:bg-[#359966] disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDocsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {docsLoading ? 'Carregando...' : `Documentos de ${docsData?.associado.nome || ''}`}
              </h2>
              <button onClick={() => { setShowDocsModal(false); setDocsData(null); }} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {docsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-[#3FA174] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : docsData && docsData.documentos.length > 0 ? (
                <div className="grid gap-4">
                  {docsData.documentos.map((doc, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Image size={20} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.tipo}</p>
                            <p className="text-xs text-gray-500">{doc.url.split('/').pop()}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#3FA174] text-white rounded-lg hover:bg-[#359966] text-sm font-medium"
                        >
                          Abrir
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhum documento enviado</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showResetSenhaModal && selectedAssociado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Redefinir Senha</h2>
              <button onClick={() => { setShowResetSenhaModal(false); setSelectedAssociado(null); }} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm text-amber-800">
                  <strong>Atenção:</strong> Você está prestes a redefinir a senha do associado <strong>{selectedAssociado.nome}</strong>. Esta ação será registrada no log de auditoria.
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Associado</p>
                <p className="font-medium text-gray-900">{selectedAssociado.nome}</p>
                <p className="text-sm text-gray-500">{selectedAssociado.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                />
              </div>

              {novaSenha && confirmaSenha && novaSenha !== confirmaSenha && (
                <p className="text-sm text-red-500">As senhas não coincidem</p>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowResetSenhaModal(false); setSelectedAssociado(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetSenha}
                disabled={!novaSenha || novaSenha.length < 8 || novaSenha !== confirmaSenha || resetandoSenha}
                className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 text-sm font-medium disabled:opacity-50"
              >
                {resetandoSenha ? 'Salvando...' : 'Redefinir Senha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPlanoModal && selectedAssociado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Atribuir Plano</h2>
              <button onClick={() => { setShowPlanoModal(false); setSelectedAssociado(null); }} className="p-2 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Associado</p>
                <p className="font-medium text-gray-900">{selectedAssociado.nome}</p>
                <p className="text-sm text-gray-500">{selectedAssociado.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Plano</label>
                {planos.length === 0 ? (
                  <p className="text-sm text-gray-500">Carregando planos...</p>
                ) : (
                  <select
                    value={selectedPlanoId}
                    onChange={(e) => setSelectedPlanoId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                  >
                    <option value="">Selecione um plano</option>
                    {planos.map((plano) => (
                      <option key={plano.id} value={plano.id}>
                        {plano.nome} - R$ {plano.valorMensalidade.toFixed(2).replace('.', ',')}/{plano.tipo === 'MENSAL' ? 'mês' : 'ano'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duração (meses)</label>
                <select
                  value={mesesPlano}
                  onChange={(e) => setMesesPlano(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                >
                  <option value={1}>1 mês</option>
                  <option value={3}>3 meses</option>
                  <option value={6}>6 meses</option>
                  <option value={12}>12 meses</option>
                </select>
              </div>

              {selectedPlanoId && (
                <div className="bg-[#3FA174]/5 border border-[#3FA174]/20 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    O plano será ativado imediatamente e terá validade de <strong>{mesesPlano} mês(es)</strong> a partir de hoje.
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowPlanoModal(false); setSelectedAssociado(null); }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleAtribuirPlano}
                disabled={!selectedPlanoId || atribuindoPlano}
                className="px-6 py-2 bg-[#3FA174] text-white rounded-xl hover:bg-[#3FA174]/90 text-sm font-medium disabled:opacity-50"
              >
                {atribuindoPlano ? 'Atribuindo...' : 'Atribuir Plano'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
