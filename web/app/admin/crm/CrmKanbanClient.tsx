'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth-client';
import AdminLayout from '@/components/layout/AdminLayout';
import { 
  Search, Filter, RefreshCw, Users, UserCheck, ClipboardList, 
  Calendar, CheckCircle2, Phone, MapPin, Clock, X, ExternalLink,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FunnelStage = 'leads' | 'associados' | 'pre_anamnese' | 'consulta_agendada' | 'consulta_realizada';

interface FunnelCard {
  id: string;
  pacienteId: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string | null;
  estado: string | null;
  criadoEm: string;
  diasNoEstagio: number;
  stage: FunnelStage;
  preAnamneseId?: string;
  proximaConsulta?: string;
  totalConsultas?: number;
}

interface FunnelData {
  leads: FunnelCard[];
  associados: FunnelCard[];
  pre_anamnese: FunnelCard[];
  consulta_agendada: FunnelCard[];
  consulta_realizada: FunnelCard[];
  counts: {
    leads: number;
    associados: number;
    pre_anamnese: number;
    consulta_agendada: number;
    consulta_realizada: number;
  };
}

const STAGE_CONFIG: Record<FunnelStage, { 
  label: string; 
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  leads: { 
    label: 'Leads', 
    icon: Users,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
  },
  associados: { 
    label: 'Associados', 
    icon: UserCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  pre_anamnese: { 
    label: 'Pré-anamnese', 
    icon: ClipboardList,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  consulta_agendada: { 
    label: 'Consulta Agendada', 
    icon: Calendar,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  consulta_realizada: { 
    label: 'Consulta Realizada', 
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

const STAGE_ORDER: FunnelStage[] = [
  'leads',
  'associados', 
  'pre_anamnese',
  'consulta_agendada',
  'consulta_realizada',
];

function formatWhatsApp(phone: string): string {
  const digits = phone?.replace(/\D/g, '') || '';
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getWhatsAppLink(phone: string, nome: string): string {
  const digits = phone?.replace(/\D/g, '') || '';
  const message = encodeURIComponent(`Olá ${nome.split(' ')[0]}, tudo bem? Aqui é da ABRACANM.`);
  return `https://wa.me/55${digits}?text=${message}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

function getDaysBadgeColor(days: number): string {
  if (days <= 3) return 'bg-green-100 text-green-700';
  if (days <= 7) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function LeadCard({ 
  card, 
  onClick 
}: { 
  card: FunnelCard; 
  onClick: () => void;
}) {
  const config = STAGE_CONFIG[card.stage];
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h4 className="font-medium text-gray-900 text-sm leading-tight line-clamp-1">
          {card.nome}
        </h4>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getDaysBadgeColor(card.diasNoEstagio)}`}>
          {card.diasNoEstagio}d
        </span>
      </div>
      
      <div className="space-y-1.5 text-xs text-gray-500">
        <a 
          href={getWhatsAppLink(card.whatsapp, card.nome)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 hover:text-green-600 transition-colors"
        >
          <Phone size={12} />
          <span>{formatWhatsApp(card.whatsapp)}</span>
        </a>
        
        {(card.cidade || card.estado) && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span>{[card.cidade, card.estado].filter(Boolean).join(', ')}</span>
          </div>
        )}
        
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>Cadastro: {formatDate(card.criadoEm)}</span>
        </div>

        {card.proximaConsulta && (
          <div className="flex items-center gap-1.5 text-amber-600 font-medium">
            <Calendar size={12} />
            <span>Consulta: {formatDate(card.proximaConsulta)}</span>
          </div>
        )}

        {card.totalConsultas !== undefined && card.totalConsultas > 0 && (
          <div className="flex items-center gap-1.5 text-green-600 font-medium">
            <CheckCircle2 size={12} />
            <span>{card.totalConsultas} consulta(s) realizada(s)</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StageColumn({
  stage,
  cards,
  count,
  onCardClick,
  isCollapsed,
  onToggleCollapse,
}: {
  stage: FunnelStage;
  cards: FunnelCard[];
  count: number;
  onCardClick: (card: FunnelCard) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;
  
  return (
    <div className={`flex flex-col bg-gray-50/50 rounded-2xl border ${config.borderColor} min-w-[280px] max-w-[320px] flex-1`}>
      <div 
        className={`p-4 border-b ${config.borderColor} ${config.bgColor} rounded-t-2xl cursor-pointer`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
              <Icon size={18} className={config.color} />
            </div>
            <h3 className={`font-semibold text-sm ${config.color}`}>{config.label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${config.bgColor} ${config.color}`}>
              {count}
            </span>
            {isCollapsed ? (
              <ChevronDown size={16} className="text-gray-400" />
            ) : (
              <ChevronUp size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[calc(100vh-280px)]"
          >
            {cards.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                Nenhum lead neste estágio
              </p>
            ) : (
              cards.map((card) => (
                <LeadCard 
                  key={card.id} 
                  card={card} 
                  onClick={() => onCardClick(card)} 
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LeadDetailModal({
  card,
  onClose,
}: {
  card: FunnelCard;
  onClose: () => void;
}) {
  const config = STAGE_CONFIG[card.stage];
  const Icon = config.icon;
  const router = useRouter();

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
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 border-b ${config.borderColor} ${config.bgColor} rounded-t-2xl`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-white shadow-sm`}>
                <Icon size={24} className={config.color} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{card.nome}</h2>
                <span className={`text-sm ${config.color} font-medium`}>{config.label}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Email</label>
              <p className="text-sm text-gray-900">{card.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">WhatsApp</label>
              <a 
                href={getWhatsAppLink(card.whatsapp, card.nome)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline flex items-center gap-1"
              >
                {formatWhatsApp(card.whatsapp)}
                <ExternalLink size={12} />
              </a>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Localização</label>
              <p className="text-sm text-gray-900">
                {[card.cidade, card.estado].filter(Boolean).join(', ') || 'Não informado'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase font-medium">Cadastro</label>
              <p className="text-sm text-gray-900">{formatDate(card.criadoEm)}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs text-gray-500 uppercase font-medium">Dias no Estágio</label>
                <p className={`text-2xl font-bold ${getDaysBadgeColor(card.diasNoEstagio).replace('bg-', 'text-').replace('-100', '-600')}`}>
                  {card.diasNoEstagio} dias
                </p>
              </div>
              {card.totalConsultas !== undefined && card.totalConsultas > 0 && (
                <div className="text-right">
                  <label className="text-xs text-gray-500 uppercase font-medium">Consultas</label>
                  <p className="text-2xl font-bold text-green-600">{card.totalConsultas}</p>
                </div>
              )}
            </div>
          </div>

          {card.proximaConsulta && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Calendar size={18} />
                <span className="font-medium">Próxima consulta: {formatDate(card.proximaConsulta)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex gap-3">
          <a
            href={getWhatsAppLink(card.whatsapp, card.nome)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium text-center hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={16} />
            WhatsApp
          </a>
          <button
            onClick={() => {
              onClose();
              router.push(`/admin/associados?search=${encodeURIComponent(card.email)}`);
            }}
            className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} />
            Ver Perfil
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CrmKanbanClient() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [selectedCard, setSelectedCard] = useState<FunnelCard | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<FunnelStage>>(new Set());
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (dataInicio) params.set('dataInicio', dataInicio);
      if (dataFim) params.set('dataFim', dataFim);

      const response = await fetch(`/api/admin/crm/funnel?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Erro ao carregar dados do funil');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [router, search, dataInicio, dataFim]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const clearFilters = () => {
    setSearch('');
    setDataInicio('');
    setDataFim('');
  };

  const toggleColumnCollapse = (stage: FunnelStage) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  const totalLeads = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;

  return (
    <AdminLayout title="CRM - Funil de Vendas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM - Funil de Vendas</h1>
            <p className="text-gray-500 text-sm">
              Acompanhe a jornada dos seus leads até a consulta
              {totalLeads > 0 && <span className="ml-2 font-medium">({totalLeads} total)</span>}
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou WhatsApp..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                placeholder="Data início"
              />
              <span className="text-gray-400">até</span>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3FA174]/30 focus:border-[#3FA174]"
                placeholder="Data fim"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#3FA174] text-white rounded-xl hover:bg-[#359966] transition-colors font-medium"
            >
              Filtrar
            </button>

            {(search || dataInicio || dataFim) && (
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 transition-colors"
              >
                Limpar
              </button>
            )}
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw size={32} className="animate-spin text-gray-400" />
          </div>
        ) : data ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGE_ORDER.map((stage) => (
              <StageColumn
                key={stage}
                stage={stage}
                cards={data[stage]}
                count={data.counts[stage]}
                onCardClick={setSelectedCard}
                isCollapsed={collapsedColumns.has(stage)}
                onToggleCollapse={() => toggleColumnCollapse(stage)}
              />
            ))}
          </div>
        ) : null}

        <AnimatePresence>
          {selectedCard && (
            <LeadDetailModal
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
