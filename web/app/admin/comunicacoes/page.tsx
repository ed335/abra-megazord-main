'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth-client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Loader2,
  Send,
  Users,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  FileText,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  History,
  Zap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Associado {
  id: string;
  nome: string;
  whatsapp: string;
  email: string;
  status: string;
  planoNome?: string;
  preAnamnese: boolean;
  criadoEm: string;
}

interface Template {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  conteudo: string;
  variaveis: string[];
}

interface EnvioHistorico {
  id: string;
  tipo: string;
  status: string;
  destinatarioNome: string;
  destinatarioWhatsapp: string;
  templateNome: string;
  criadoEm: string;
}

interface LoteHistorico {
  id: string;
  templateNome: string;
  totalDestinatarios: number;
  enviadas: number;
  falhas: number;
  status: string;
  criadoEm: string;
}

interface MessageStats {
  sent: number;
  limit: number;
  resetIn: number;
}

const CATEGORIAS_TEMPLATE = [
  { value: 'GERAL', label: 'Geral' },
  { value: 'BOAS_VINDAS', label: 'Boas-vindas' },
  { value: 'AGENDAMENTO', label: 'Agendamento' },
  { value: 'PAGAMENTO', label: 'Pagamento' },
  { value: 'PROMOCAO', label: 'Promoção' },
];

const VARIAVEIS_DISPONIVEIS = [
  { key: 'nome', label: 'Nome do paciente', example: 'João Silva' },
  { key: 'plano', label: 'Nome do plano', example: 'Plano Premium' },
  { key: 'email', label: 'Email', example: 'joao@email.com' },
  { key: 'data', label: 'Data atual', example: '15/01/2026' },
];

export default function AdminComunicacoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'enviar' | 'templates' | 'historico'>('enviar');
  
  const [associados, setAssociados] = useState<Associado[]>([]);
  const [selectedAssociados, setSelectedAssociados] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [historico, setHistorico] = useState<EnvioHistorico[]>([]);
  const [lotes, setLotes] = useState<LoteHistorico[]>([]);
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null);
  
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPlano, setFiltroPlano] = useState<string>('todos');
  const [filtroPreAnamnese, setFiltroPreAnamnese] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [templateSelecionado, setTemplateSelecionado] = useState<string>('_none');
  
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [novoTemplate, setNovoTemplate] = useState({
    nome: '',
    descricao: '',
    categoria: 'GERAL',
    conteudo: '',
    variaveis: [] as string[],
  });
  
  const [envioProgress, setEnvioProgress] = useState<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const token = getAdminToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const [assocRes, templatesRes, historicoRes, statsRes] = await Promise.all([
        fetch('/api/admin/comunicacoes/associados', { headers }),
        fetch('/api/admin/comunicacoes/templates', { headers }),
        fetch('/api/admin/comunicacoes/historico', { headers }),
        fetch('/api/admin/comunicacoes/stats', { headers }),
      ]);

      if (assocRes.ok) {
        const data = await assocRes.json();
        setAssociados(data.associados || []);
      }
      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      }
      if (historicoRes.ok) {
        const data = await historicoRes.json();
        setHistorico(data.mensagens || []);
        setLotes(data.lotes || []);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setMessageStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAssociados = associados.filter(a => {
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    if (filtroPlano !== 'todos' && a.planoNome !== filtroPlano) return false;
    if (filtroPreAnamnese === 'sim' && !a.preAnamnese) return false;
    if (filtroPreAnamnese === 'nao' && a.preAnamnese) return false;
    if (searchTerm && !a.nome.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const planosUnicos = [...new Set(associados.map(a => a.planoNome).filter(Boolean))];

  const handleSelectAll = () => {
    if (selectedAssociados.length === filteredAssociados.length) {
      setSelectedAssociados([]);
    } else {
      setSelectedAssociados(filteredAssociados.map(a => a.id));
    }
  };

  const handleSelectAssociado = (id: string) => {
    setSelectedAssociados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getMensagemFinal = () => {
    if (templateSelecionado && templateSelecionado !== '_none') {
      const template = templates.find(t => t.id === templateSelecionado);
      return template?.conteudo || '';
    }
    return mensagemPersonalizada;
  };

  const handleEnviarMensagens = async () => {
    if (selectedAssociados.length === 0) {
      toast.error('Selecione pelo menos um destinatário');
      return;
    }

    const mensagem = getMensagemFinal();
    if (!mensagem.trim()) {
      toast.error('Digite uma mensagem ou selecione um template');
      return;
    }

    setSending(true);
    setEnvioProgress({ current: 0, total: selectedAssociados.length, status: 'Iniciando...' });

    try {
      const token = getAdminToken();
      const response = await fetch('/api/admin/comunicacoes/enviar-massa', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          destinatarios: selectedAssociados,
          mensagem,
          templateId: templateSelecionado !== '_none' ? templateSelecionado : undefined,
          filtrosUsados: {
            status: filtroStatus,
            plano: filtroPlano,
            preAnamnese: filtroPreAnamnese,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Envio concluído: ${data.enviadas} enviadas, ${data.falhas} falhas`);
        setSelectedAssociados([]);
        setMensagemPersonalizada('');
        setTemplateSelecionado('_none');
        fetchData();
      } else {
        toast.error(data.error || 'Erro ao enviar mensagens');
      }
    } catch (error) {
      toast.error('Erro ao enviar mensagens');
    } finally {
      setSending(false);
      setEnvioProgress(null);
    }
  };

  const handleSalvarTemplate = async () => {
    if (!novoTemplate.nome || !novoTemplate.conteudo) {
      toast.error('Nome e conteúdo são obrigatórios');
      return;
    }

    try {
      const token = getAdminToken();
      const response = await fetch('/api/admin/comunicacoes/templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(novoTemplate),
      });

      if (response.ok) {
        toast.success('Template salvo com sucesso');
        setShowTemplateDialog(false);
        setNovoTemplate({ nome: '', descricao: '', categoria: 'GERAL', conteudo: '', variaveis: [] });
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erro ao salvar template');
      }
    } catch (error) {
      toast.error('Erro ao salvar template');
    }
  };

  const handleDeletarTemplate = async (id: string) => {
    if (!confirm('Deseja realmente excluir este template?')) return;

    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/comunicacoes/templates/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        toast.success('Template excluído');
        fetchData();
      }
    } catch (error) {
      toast.error('Erro ao excluir template');
    }
  };

  const formatResetTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Central de Comunicações</h1>
            <p className="text-gray-500">Envie mensagens em massa via WhatsApp</p>
          </div>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {messageStats && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Zap className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Limite de Envios</p>
                    <p className="text-sm text-gray-600">
                      {messageStats.sent}/{messageStats.limit} mensagens enviadas nesta hora
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Reset em</p>
                  <p className="font-semibold text-green-700">{formatResetTime(messageStats.resetIn)}</p>
                </div>
              </div>
              <div className="mt-3 bg-white/50 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(messageStats.sent / messageStats.limit) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('enviar')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'enviar'
                ? 'border-verde-oliva text-verde-oliva'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Enviar Mensagens
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'templates'
                ? 'border-verde-oliva text-verde-oliva'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Templates
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'historico'
                ? 'border-verde-oliva text-verde-oliva'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Histórico
          </button>
        </div>

        {activeTab === 'enviar' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtrar Destinatários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Buscar</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Nome..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="APROVADO">Aprovado</SelectItem>
                          <SelectItem value="PENDENTE">Pendente</SelectItem>
                          <SelectItem value="EM_ANALISE">Em Análise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Plano</Label>
                      <Select value={filtroPlano} onValueChange={setFiltroPlano}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          {planosUnicos.filter(p => p).map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Pré-Anamnese</Label>
                      <Select value={filtroPreAnamnese} onValueChange={setFiltroPreAnamnese}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="sim">Preenchida</SelectItem>
                          <SelectItem value="nao">Não preenchida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Destinatários ({filteredAssociados.length})
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedAssociados.length === filteredAssociados.length && filteredAssociados.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm text-gray-500">
                        Selecionar todos ({selectedAssociados.length} selecionados)
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredAssociados.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">Nenhum associado encontrado</p>
                    ) : (
                      filteredAssociados.map(a => (
                        <div
                          key={a.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedAssociados.includes(a.id)
                              ? 'bg-green-50 border-green-300'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleSelectAssociado(a.id)}
                        >
                          <Checkbox
                            checked={selectedAssociados.includes(a.id)}
                            onCheckedChange={() => handleSelectAssociado(a.id)}
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{a.nome}</p>
                            <p className="text-sm text-gray-500">{a.whatsapp}</p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={a.status === 'APROVADO' ? 'default' : 'secondary'}>
                              {a.status}
                            </Badge>
                            {a.planoNome && (
                              <Badge variant="outline">{a.planoNome}</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Mensagem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Usar Template</Label>
                    <Select value={templateSelecionado} onValueChange={setTemplateSelecionado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_none">Mensagem personalizada</SelectItem>
                        {templates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {templateSelecionado === '_none' && (
                    <div>
                      <Label>Mensagem Personalizada</Label>
                      <textarea
                        className="w-full min-h-[200px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-verde-oliva focus:border-transparent"
                        placeholder="Digite sua mensagem...&#10;&#10;Use variáveis como {{nome}}, {{plano}}"
                        value={mensagemPersonalizada}
                        onChange={(e) => setMensagemPersonalizada(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variáveis: {'{{nome}}'}, {'{{plano}}'}, {'{{email}}'}, {'{{data}}'}
                      </p>
                    </div>
                  )}

                  {templateSelecionado && templateSelecionado !== '_none' && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-xs text-gray-500">Prévia do Template</Label>
                      <p className="text-sm whitespace-pre-wrap mt-1">
                        {templates.find(t => t.id === templateSelecionado)?.conteudo}
                      </p>
                    </div>
                  )}

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium">Delay inteligente ativo</p>
                        <p>Intervalo de 5-15 segundos entre cada mensagem para evitar bloqueio do WhatsApp.</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleEnviarMensagens}
                    disabled={sending || selectedAssociados.length === 0}
                    className="w-full bg-verde-oliva hover:bg-verde-oliva/90"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar para {selectedAssociados.length} destinatário(s)
                      </>
                    )}
                  </Button>

                  {envioProgress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{envioProgress.status}</span>
                        <span>{envioProgress.current}/{envioProgress.total}</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-verde-oliva h-2 rounded-full transition-all"
                          style={{ width: `${(envioProgress.current / envioProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Templates de Mensagem</h2>
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-verde-oliva hover:bg-verde-oliva/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Template</DialogTitle>
                    <DialogDescription>
                      Crie um template para reutilizar em envios futuros
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Template</Label>
                        <Input
                          value={novoTemplate.nome}
                          onChange={(e) => setNovoTemplate({ ...novoTemplate, nome: e.target.value })}
                          placeholder="Ex: Boas-vindas Novo Associado"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={novoTemplate.categoria}
                          onValueChange={(v: string) => setNovoTemplate({ ...novoTemplate, categoria: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS_TEMPLATE.map(c => (
                              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Input
                        value={novoTemplate.descricao}
                        onChange={(e) => setNovoTemplate({ ...novoTemplate, descricao: e.target.value })}
                        placeholder="Breve descrição do uso deste template"
                      />
                    </div>
                    <div>
                      <Label>Conteúdo da Mensagem</Label>
                      <textarea
                        className="w-full min-h-[200px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-verde-oliva focus:border-transparent"
                        value={novoTemplate.conteudo}
                        onChange={(e) => setNovoTemplate({ ...novoTemplate, conteudo: e.target.value })}
                        placeholder="Digite o conteúdo do template..."
                      />
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <Label className="text-xs text-gray-500">Variáveis Disponíveis</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {VARIAVEIS_DISPONIVEIS.map((v: { key: string; label: string; example: string }) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => setNovoTemplate({
                              ...novoTemplate,
                              conteudo: novoTemplate.conteudo + `{{${v.key}}}`
                            })}
                            className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
                          >
                            {`{{${v.key}}}`} - {v.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSalvarTemplate} className="bg-verde-oliva hover:bg-verde-oliva/90">
                        Salvar Template
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum template criado ainda</p>
                    <p className="text-sm">Crie seu primeiro template para agilizar os envios</p>
                  </CardContent>
                </Card>
              ) : (
                templates.map(t => (
                  <Card key={t.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{t.nome}</CardTitle>
                        <Badge variant="outline">{t.categoria}</Badge>
                      </div>
                      {t.descricao && (
                        <p className="text-sm text-gray-500">{t.descricao}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">
                        {t.conteudo}
                      </p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletarTemplate(t.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Excluir
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setTemplateSelecionado(t.id);
                            setActiveTab('enviar');
                          }}
                          className="bg-verde-oliva hover:bg-verde-oliva/90"
                        >
                          Usar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lotes de Envio em Massa</CardTitle>
              </CardHeader>
              <CardContent>
                {lotes.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhum envio em massa realizado</p>
                ) : (
                  <div className="space-y-3">
                    {lotes.map(l => (
                      <div key={l.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{l.templateNome || 'Mensagem personalizada'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(l.criadoEm).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{l.totalDestinatarios}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{l.enviadas}</p>
                            <p className="text-xs text-gray-500">Enviadas</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">{l.falhas}</p>
                            <p className="text-xs text-gray-500">Falhas</p>
                          </div>
                          <Badge variant={l.status === 'CONCLUIDO' ? 'default' : 'secondary'}>
                            {l.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Mensagens Individuais</CardTitle>
              </CardHeader>
              <CardContent>
                {historico.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma mensagem enviada</p>
                ) : (
                  <div className="space-y-2">
                    {historico.slice(0, 20).map(h => (
                      <div key={h.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {h.status === 'ENVIADA' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : h.status === 'FALHA' ? (
                            <XCircle className="w-5 h-5 text-red-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{h.destinatarioNome}</p>
                            <p className="text-sm text-gray-500">{h.destinatarioWhatsapp}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(h.criadoEm).toLocaleString('pt-BR')}
                          </p>
                          {h.templateNome && (
                            <Badge variant="outline" className="text-xs">{h.templateNome}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
