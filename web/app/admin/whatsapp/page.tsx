'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { MessageCircle, Send, Users, Filter, Copy, ExternalLink, Check, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/layout/AdminLayout';

type Mensagem = {
  id: string;
  nome: string;
  whatsapp: string;
  numero: string;
  mensagem: string;
  link: string;
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
];

const VARIAVEIS = [
  { codigo: '{nome}', descricao: 'Nome completo' },
  { codigo: '{primeiro_nome}', descricao: 'Primeiro nome' },
  { codigo: '{cidade}', descricao: 'Cidade' },
  { codigo: '{estado}', descricao: 'Estado' },
  { codigo: '{patologia}', descricao: 'Patologia (CID)' },
];

export default function WhatsAppPage() {
  const [template, setTemplate] = useState('');
  const [filtros, setFiltros] = useState({
    cidade: '',
    estado: '',
    patologia: '',
    status: '',
  });
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  const handleGerarMensagens = async () => {
    if (!template.trim()) {
      setError('Digite ou selecione um template');
      return;
    }

    setLoading(true);
    setError('');
    const token = getToken();

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
        router.push('/login');
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSelectTemplate = (texto: string) => {
    setTemplate(texto);
  };

  const handleInsertVariable = (codigo: string) => {
    setTemplate(prev => prev + codigo);
  };

  return (
    <AdminLayout title="Mensagens WhatsApp">
      <div className="space-y-6">
        {error && (
          <div className="mb-4 p-4 bg-erro/10 border border-erro/30 rounded-lg text-erro flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white border border-cinza-claro rounded-xl p-6">
              <h2 className="font-semibold text-cinza-escuro mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-verde-oliva" />
                Template da Mensagem
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-cinza-escuro mb-2">
                  Templates prontos
                </label>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES_PRONTOS.map((t, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectTemplate(t.texto)}
                      className="px-3 py-1.5 text-sm bg-cinza-muito-claro hover:bg-cinza-claro rounded-lg transition-colors"
                    >
                      {t.nome}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-cinza-escuro mb-2">
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
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Digite sua mensagem aqui. Use as variáveis acima para personalizar..."
                className="w-full h-48 px-4 py-3 border border-cinza-claro rounded-lg focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva resize-none"
              />
            </div>

            <div className="bg-white border border-cinza-claro rounded-xl p-6">
              <h2 className="font-semibold text-cinza-escuro mb-4 flex items-center gap-2">
                <Filter size={20} className="text-verde-oliva" />
                Filtrar Destinatários
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Cidade</label>
                  <input
                    type="text"
                    value={filtros.cidade}
                    onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                    placeholder="Ex: São Paulo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Estado</label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                  >
                    <option value="">Todos</option>
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Patologia</label>
                  <input
                    type="text"
                    value={filtros.patologia}
                    onChange={(e) => setFiltros({ ...filtros, patologia: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
                    placeholder="Ex: Epilepsia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-cinza-escuro mb-1">Status</label>
                  <select
                    value={filtros.status}
                    onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    className="w-full px-3 py-2 border border-cinza-claro rounded-lg text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva"
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
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-verde-oliva text-white rounded-lg hover:bg-verde-oliva/90 transition-colors disabled:opacity-50 font-medium"
              >
                <Send size={18} />
                {loading ? 'Gerando...' : 'Gerar Mensagens'}
              </button>
            </div>
          </div>

          <div className="bg-white border border-cinza-claro rounded-xl p-6">
            <h2 className="font-semibold text-cinza-escuro mb-4 flex items-center gap-2">
              <Users size={20} className="text-verde-oliva" />
              Mensagens Geradas
              {mensagens.length > 0 && (
                <span className="text-sm font-normal text-cinza-medio ml-2">
                  ({mensagens.length} destinatários)
                </span>
              )}
            </h2>

            {mensagens.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-cinza-muito-claro rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle size={32} className="text-cinza-claro" />
                </div>
                <p className="text-cinza-medio">
                  Configure o template e clique em &quot;Gerar Mensagens&quot;
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {mensagens.map((msg) => (
                  <div key={msg.id} className="border border-cinza-claro rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-cinza-escuro">{msg.nome}</p>
                        <p className="text-sm text-cinza-medio">{msg.whatsapp}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.mensagem, msg.id)}
                          className="p-2 text-cinza-medio hover:text-cinza-escuro hover:bg-cinza-muito-claro rounded-lg transition-colors"
                          title="Copiar mensagem"
                        >
                          {copied === msg.id ? <Check size={16} className="text-sucesso" /> : <Copy size={16} />}
                        </button>
                        <a
                          href={msg.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          title="Abrir no WhatsApp"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>
                    <div className="bg-cinza-muito-claro rounded-lg p-3 text-sm text-cinza-escuro whitespace-pre-wrap">
                      {msg.mensagem}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
