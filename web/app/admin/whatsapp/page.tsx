'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/lib/admin-auth-client';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Filter, 
  Copy, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Rocket,
  History,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

type Mensagem = {
  id: string;
  nome: string;
  whatsapp: string;
  numero: string;
  mensagem: string;
  link: string;
};

type HistoricoMensagem = {
  id: string;
  tipo: string;
  status: string;
  destinatarioNome: string | null;
  destinatarioWhatsapp: string;
  mensagem: string;
  erro: string | null;
  criadoEm: string;
  admin: {
    usuario: {
      email: string;
    };
  };
};

type LoteMensagem = {
  id: string;
  templateNome: string | null;
  totalDestinatarios: number;
  enviadas: number;
  falhas: number;
  status: string;
  criadoEm: string;
  admin: {
    usuario: {
      email: string;
    };
  };
};

const TEMPLATES_PRONTOS = [
  {
    nome: 'Boas-vindas',
    texto: 'Olá {primeiro_nome}! 🌿\n\nSeja bem-vindo(a) à ABRACANM! Estamos muito felizes em tê-lo(a) conosco.\n\nQualquer dúvida, estamos à disposição.\n\nAbraços,\nEquipe ABRACANM'
  },
  {
    nome: 'Lembrete Pré-Anamnese',
    texto: 'Olá {primeiro_nome}!\n\nNotamos que você ainda não completou sua pré-anamnese na ABRACANM.\n\nEsse passo é importante para personalizarmos seu atendimento. Acesse seu painel para continuar.\n\nQualquer dúvida, estamos aqui!\n\nAbraços,\nEquipe ABRACANM'
  },
  {
    nome: 'Novidades',
    texto: 'Olá {primeiro_nome}! 🌿\n\nTemos novidades na ABRACANM! Acesse nosso painel para conferir.\n\nContinuamos trabalhando para oferecer o melhor atendimento a você.\n\nAbraços,\nEquipe ABRACANM'
  },
  {
    nome: 'Lembrete Consulta',
    texto: 'Olá {primeiro_nome}! 📅\n\nEste é um lembrete sobre sua consulta agendada na ABRACANM.\n\nNão se esqueça de verificar a data e horário no seu painel.\n\nQualquer dúvida, estamos à disposição!\n\nAbraços,\nEquipe ABRACANM'
  },
];

const VARIAVEIS = [
  { codigo: '{nome}', descricao: 'Nome completo' },
  { codigo: '{primeiro_nome}', descricao: 'Primeiro nome' },
  { codigo: '{cidade}', descricao: 'Cidade' },
  { codigo: '{estado}', descricao: 'Estado' },
  { codigo: '{patologia}', descricao: 'Patologia (CID)' },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'enviar' | 'historico'>('enviar');
  const [template, setTemplate] = useState('');
  const [templateNome, setTemplateNome] = useState('');
  const [filtros, setFiltros] = useState({
    cidade: '',
    estado: '',
    patologia: '',
    status: '',
  });
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [historico, setHistorico] = useState<HistoricoMensagem[]>([]);
  const [lotes, setLotes] = useState<LoteMensagem[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (activeTab === 'historico') {
      carregarHistorico();
    }
  }, [activeTab]);

  const carregarHistorico = async () => {
    setLoadingHistorico(true);
    const token = getAdminToken();
    
    try {
      const response = await fetch('/api/admin/whatsapp/historico', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setHistorico(data.mensagens);
        setLotes(data.lotes);
      }
    } catch {
      console.error('Erro ao carregar histórico');
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleGerarMensagens = async () => {
    if (!template.trim()) {
      setError('Digite ou selecione um template');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    const token = getAdminToken();

    try {
      const response = await fetch('/api/admin/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ template, filtros }),
      });

      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar mensagens');
      }

      setMensagens(data.mensagens);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensagens = async () => {
    if (mensagens.length === 0) {
      setError('Gere as mensagens primeiro');
      return;
    }

    const confirmar = window.confirm(
      `Você está prestes a enviar ${mensagens.length} mensagens via WhatsApp.\n\nEssa ação não pode ser desfeita. Continuar?`
    );

    if (!confirmar) return;

    setSending(true);
    setError('');
    setSuccess('');
    const token = getAdminToken();

    try {
      const response = await fetch('/api/admin/whatsapp/enviar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinatarios: mensagens.map(m => ({
            id: m.id,
            nome: m.nome,
            whatsapp: m.whatsapp,
            mensagem: m.mensagem,
          })),
          templateNome: templateNome || 'Personalizado',
          filtrosUsados: filtros,
          tipo: 'MASSA',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagens');
      }

      if (data.falhas === data.total) {
        setError('Nenhuma mensagem foi enviada. Verifique se a Evolution API está configurada corretamente.');
      } else if (data.falhas > 0) {
        setSuccess(`Envio parcial: ${data.enviadas} enviadas, ${data.falhas} falhas.`);
        setMensagens([]);
        carregarHistorico();
      } else {
        setSuccess(`Envio concluído! ${data.enviadas} mensagens enviadas com sucesso.`);
        setMensagens([]);
        carregarHistorico();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar mensagens');
    } finally {
      setSending(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectTemplate = (nome: string, texto: string) => {
    setTemplate(texto);
    setTemplateNome(nome);
  };

  const handleInsertVariable = (codigo: string) => {
    setTemplate(prev => prev + codigo);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ENVIADA':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'FALHA':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  return (
    <AdminLayout title="Mensagens WhatsApp">
      <div className="space-y-6">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('enviar')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'enviar'
                ? 'text-verde-oliva border-b-2 border-verde-oliva'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Send size={18} className="inline-block mr-2" />
            Enviar Mensagens
          </button>
          <button
            onClick={() => setActiveTab('historico')}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === 'historico'
                ? 'text-verde-oliva border-b-2 border-verde-oliva'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <History size={18} className="inline-block mr-2" />
            Histórico
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {activeTab === 'enviar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageCircle size={20} className="text-verde-oliva" />
                  Template da Mensagem
                </h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Templates prontos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES_PRONTOS.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectTemplate(t.nome, t.texto)}
                        className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                          templateNome === t.nome
                            ? 'bg-verde-oliva text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {t.nome}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variáveis disponíveis
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {VARIAVEIS.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => handleInsertVariable(v.codigo)}
                        className="px-2 py-1 text-xs bg-verde-oliva/10 text-verde-oliva rounded hover:bg-verde-oliva/20 transition-colors"
                        title={v.descricao}
                      >
                        {v.codigo}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    setTemplateNome('');
                  }}
                  placeholder="Digite sua mensagem aqui. Use as variáveis acima para personalizar..."
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva resize-none"
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter size={20} className="text-verde-oliva" />
                  Filtrar Destinatários
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={filtros.cidade}
                      onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                    <select
                      value={filtros.estado}
                      onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                    >
                      <option value="">Todos</option>
                      {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Patologia</label>
                    <input
                      type="text"
                      value={filtros.patologia}
                      onChange={(e) => setFiltros({ ...filtros, patologia: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                      placeholder="Ex: Epilepsia"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filtros.status}
                      onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                    >
                      <option value="">Todos</option>
                      <option value="ativo">Ativos</option>
                      <option value="inativo">Inativos</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGerarMensagens}
                  disabled={loading || !template.trim()}
                  className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                >
                  <Users size={18} />
                  {loading ? 'Gerando...' : 'Gerar Lista de Mensagens'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <MessageCircle size={20} className="text-verde-oliva" />
                  Mensagens Geradas
                  {mensagens.length > 0 && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({mensagens.length} destinatários)
                    </span>
                  )}
                </h2>
              </div>

              {mensagens.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle size={32} className="text-gray-300" />
                  </div>
                  <p className="text-gray-500">
                    Configure o template e clique em &quot;Gerar Lista&quot;
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-verde-oliva/5 border border-verde-oliva/20 rounded-lg">
                    <button
                      onClick={handleEnviarMensagens}
                      disabled={sending}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-verde-oliva text-white rounded-lg hover:bg-verde-oliva/90 transition-colors disabled:opacity-50 font-medium"
                    >
                      <Rocket size={18} />
                      {sending ? 'Enviando...' : `Enviar ${mensagens.length} Mensagens via WhatsApp`}
                    </button>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Envia diretamente via Evolution API (requer configuração)
                    </p>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {mensagens.map((msg) => (
                      <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{msg.nome}</p>
                            <p className="text-sm text-gray-500">{msg.whatsapp}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(msg.mensagem, msg.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copiar mensagem"
                            >
                              {copied === msg.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                            <a
                              href={msg.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                              title="Abrir no WhatsApp Web"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap">
                          {msg.mensagem}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={carregarHistorico}
                disabled={loadingHistorico}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={loadingHistorico ? 'animate-spin' : ''} />
                Atualizar
              </button>
            </div>

            {lotes.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Envios em Massa Recentes</h3>
                <div className="space-y-3">
                  {lotes.map((lote) => (
                    <div key={lote.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          {lote.templateNome || 'Mensagem personalizada'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(lote.criadoEm).toLocaleString('pt-BR')} • {lote.admin?.usuario?.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">{lote.totalDestinatarios} total</span>
                          <span className="text-sm text-green-600">{lote.enviadas} enviadas</span>
                          {lote.falhas > 0 && (
                            <span className="text-sm text-red-600">{lote.falhas} falhas</span>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          lote.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {lote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Mensagens Individuais Recentes</h3>
              {loadingHistorico ? (
                <div className="text-center py-8 text-gray-500">Carregando...</div>
              ) : historico.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma mensagem enviada ainda</div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {historico.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <div className="mt-1">{getStatusIcon(msg.status)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 truncate">
                            {msg.destinatarioNome || msg.destinatarioWhatsapp}
                          </p>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.criadoEm).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{msg.destinatarioWhatsapp}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{msg.mensagem}</p>
                        {msg.erro && (
                          <p className="text-xs text-red-600 mt-1">{msg.erro}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
