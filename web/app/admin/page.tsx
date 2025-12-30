'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth-client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Activity,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Bell,
  Target,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

type DashboardMetrics = {
  periodo: number;
  financeiro: {
    receita: number;
    receitaAnterior: number;
    variacaoReceita: number;
    totalTransacoes: number;
    mrr: number;
    receitaPorTipo: { tipo: string; valor: number; quantidade: number }[];
    receitaMensal: { mes: string; valor: number; quantidade: number }[];
  };
  assinaturas: {
    ativas: number;
    novas: number;
    canceladas: number;
    expirando: number;
    churnRate: number;
    porPlano: { planoId: string; planoNome: string; quantidade: number }[];
  };
  consultas: {
    realizadas: number;
    agendadas: number;
    canceladas: number;
    taxaCancelamento: number;
  };
  funil: {
    cadastros: number;
    preAnamnese: number;
    assinaturas: number;
    consultas: number;
    taxas: {
      preAnamnese: number;
      assinatura: number;
      consulta: number;
      total: number;
    };
  };
  alertas: {
    pagamentosPendentes: number;
    assinaturasExpirando: number;
    consultasHoje: number;
  };
  pagamentosPendentes: {
    id: string;
    valor: number;
    tipo: string;
    paciente: string;
    email: string;
    expiracao: string;
    criadoEm: string;
  }[];
  atividadeRecente: {
    id: string;
    acao: string;
    recurso: string;
    usuario: string;
    criadoEm: string;
  }[];
};

const CORES_PLANOS = ['#3FA174', '#6EC1E4', '#F59E0B', '#8B5CF6', '#EC4899'];

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

const formatarData = (data: string) => {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function MetricCard({
  titulo,
  valor,
  variacao,
  icone: Icon,
  cor,
  prefixo = '',
  sufixo = ''
}: {
  titulo: string;
  valor: string | number;
  variacao?: number;
  icone: React.ElementType;
  cor: string;
  prefixo?: string;
  sufixo?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{titulo}</p>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
              {prefixo}{typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor}{sufixo}
            </p>
            {variacao !== undefined && (
              <div className={`flex items-center gap-1 text-xs sm:text-sm ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variacao >= 0 ? <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" /> : <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />}
                <span className="truncate">{Math.abs(variacao)}% vs anterior</span>
              </div>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-xl ${cor} flex-shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunilConversao({ funil }: { funil: DashboardMetrics['funil'] }) {
  const etapas = [
    { nome: 'Cadastros', valor: funil.cadastros, cor: 'bg-blue-500', taxa: 100 },
    { nome: 'Pré-Anamnese', valor: funil.preAnamnese, cor: 'bg-purple-500', taxa: funil.taxas.preAnamnese },
    { nome: 'Assinaturas', valor: funil.assinaturas, cor: 'bg-amber-500', taxa: funil.taxas.assinatura },
    { nome: 'Consultas', valor: funil.consultas, cor: 'bg-green-500', taxa: funil.taxas.consulta },
  ];

  const maxValor = Math.max(...etapas.map(e => e.valor), 1);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#3FA174]" />
              Funil de Conversão
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Taxa de conversão total: {funil.taxas.total}%</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700 w-fit text-xs sm:text-sm">
            {funil.taxas.total}% conversão
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {etapas.map((etapa, index) => (
          <div key={etapa.nome} className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-medium text-gray-700">{etapa.nome}</span>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-gray-900 font-semibold">{etapa.valor}</span>
                {index > 0 && (
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0">
                    {etapa.taxa}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="h-6 sm:h-8 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${etapa.cor} transition-all duration-500 rounded-lg flex items-center justify-end px-2 sm:px-3`}
                style={{ width: `${(etapa.valor / maxValor) * 100}%` }}
              >
                {etapa.valor > 0 && (
                  <span className="text-white text-[10px] sm:text-xs font-medium">
                    {Math.round((etapa.valor / maxValor) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AlertasCard({ alertas }: { 
  alertas: DashboardMetrics['alertas'];
}) {
  const totalAlertas = alertas.pagamentosPendentes + alertas.assinaturasExpirando;

  return (
    <Card className={totalAlertas > 0 ? 'border-amber-200 bg-amber-50/50' : ''}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            <span className="hidden xs:inline">Alertas & </span>Notificações
          </CardTitle>
          {totalAlertas > 0 && (
            <Badge className="bg-amber-500 text-xs">{totalAlertas}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
        {alertas.consultasHoje > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-blue-50 rounded-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-900">{alertas.consultasHoje} consultas hoje</p>
              <p className="text-[10px] sm:text-xs text-blue-600 hidden sm:block">Acompanhe os atendimentos</p>
            </div>
            <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </div>
        )}
        
        {alertas.pagamentosPendentes > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-amber-900">{alertas.pagamentosPendentes} pagamentos pendentes</p>
              <p className="text-[10px] sm:text-xs text-amber-600 hidden sm:block">Aguardando PIX</p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>
        )}
        
        {alertas.assinaturasExpirando > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-red-900">{alertas.assinaturasExpirando} assinaturas expirando</p>
              <p className="text-[10px] sm:text-xs text-red-600 hidden sm:block">Próximos 7 dias</p>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 flex-shrink-0" />
          </div>
        )}

        {totalAlertas === 0 && alertas.consultasHoje === 0 && (
          <div className="text-center py-3 sm:py-4 text-gray-500">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs sm:text-sm">Nenhum alerta</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AtividadeRecente({ atividades }: { atividades: DashboardMetrics['atividadeRecente'] }) {
  const getAcaoInfo = (acao: string) => {
    const map: Record<string, { label: string; cor: string }> = {
      'CADASTRO': { label: 'Cadastro', cor: 'bg-green-100 text-green-700' },
      'LOGIN': { label: 'Login', cor: 'bg-blue-100 text-blue-700' },
      'PAGAMENTO': { label: 'Pagamento', cor: 'bg-amber-100 text-amber-700' },
      'ASSINATURA': { label: 'Assinatura', cor: 'bg-purple-100 text-purple-700' },
      'CONSULTA': { label: 'Consulta', cor: 'bg-teal-100 text-teal-700' },
    };
    return map[acao] || { label: acao, cor: 'bg-gray-100 text-gray-700' };
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#3FA174]" />
          Atividade Recente
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Últimas 24 horas</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {atividades.slice(0, 6).map((atividade) => {
            const info = getAcaoInfo(atividade.acao);
            return (
              <div key={atividade.id} className="flex items-center gap-2 sm:gap-3 py-1.5 sm:py-2 border-b border-gray-100 last:border-0">
                <Badge className={`${info.cor} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5`} variant="secondary">
                  {info.label}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-900 truncate">{atividade.usuario}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate hidden sm:block">{atividade.recurso}</p>
                </div>
                <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap hidden xs:block">
                  {formatarData(atividade.criadoEm)}
                </span>
              </div>
            );
          })}
          {atividades.length === 0 && (
            <div className="text-center py-4 sm:py-6 text-gray-500">
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMetrics = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const response = await fetch(`/api/admin/dashboard/metrics?periodo=${periodo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) throw new Error('Erro ao carregar métricas');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo, router]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!metrics) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-12">
          <p className="text-gray-500">Erro ao carregar métricas</p>
          <Button onClick={handleRefresh} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Visão Geral</h1>
            <p className="text-xs sm:text-sm text-gray-500">Métricas dos últimos {periodo} dias</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm bg-white flex-1 sm:flex-none"
            >
              <option value="7">7 dias</option>
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="365">1 ano</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-2 sm:px-3"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-2">Atualizar</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            titulo="Receita Total"
            valor={formatarMoeda(metrics.financeiro.receita)}
            variacao={metrics.financeiro.variacaoReceita}
            icone={DollarSign}
            cor="bg-green-500"
          />
          <MetricCard
            titulo="MRR"
            valor={formatarMoeda(metrics.financeiro.mrr)}
            icone={TrendingUp}
            cor="bg-blue-500"
          />
          <MetricCard
            titulo="Assinaturas Ativas"
            valor={metrics.assinaturas.ativas}
            icone={CreditCard}
            cor="bg-purple-500"
          />
          <MetricCard
            titulo="Consultas Realizadas"
            valor={metrics.consultas.realizadas}
            icone={Calendar}
            cor="bg-amber-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Receita Mensal</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Evolução dos últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="h-56 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.financeiro.receitaMensal}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3FA174" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3FA174" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="mes" 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value: string) => {
                        const [, month] = value.split('-');
                        const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
                        return months[parseInt(month) - 1];
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value: number) => `${(value / 1000).toFixed(0)}k`}
                      width={35}
                    />
                    <Tooltip 
                      formatter={(value) => [formatarMoeda(Number(value)), 'Receita']}
                      labelFormatter={(label: string) => {
                        const [year, month] = label.split('-');
                        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                        return `${months[parseInt(month) - 1]} ${year}`;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="valor" 
                      stroke="#3FA174" 
                      strokeWidth={2}
                      fill="url(#colorReceita)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <FunilConversao funil={metrics.funil} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Assinaturas por Plano</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Distribuição atual</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.assinaturas.porPlano}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="quantidade"
                      nameKey="planoNome"
                    >
                      {metrics.assinaturas.porPlano.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_PLANOS[index % CORES_PLANOS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [Number(value), String(name)]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <AlertasCard 
            alertas={metrics.alertas} 
          />

          <AtividadeRecente atividades={metrics.atividadeRecente} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Novas Assinaturas</h3>
                <Badge className="bg-green-100 text-green-700 text-xs">{metrics.assinaturas.novas}</Badge>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Canceladas</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{metrics.assinaturas.canceladas}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Churn</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{metrics.assinaturas.churnRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Consultas</h3>
                <Badge className="bg-blue-100 text-blue-700 text-xs">{metrics.consultas.agendadas}</Badge>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Canceladas</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{metrics.consultas.canceladas}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Taxa Canc.</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{metrics.consultas.taxaCancelamento}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="sm:col-span-2 md:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Transações</h3>
                <Badge className="bg-amber-100 text-amber-700 text-xs">{metrics.financeiro.totalTransacoes}</Badge>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                {metrics.financeiro.receitaPorTipo.slice(0, 3).map((tipo) => (
                  <div key={tipo.tipo} className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 truncate">{tipo.tipo}</span>
                    <span className="font-medium">{formatarMoeda(tipo.valor)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
