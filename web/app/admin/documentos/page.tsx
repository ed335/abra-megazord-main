'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  User,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

interface DocumentoRevisao {
  id: string;
  tipo: string;
  status: string;
  url: string | null;
  nomeArquivo: string | null;
  versao: number;
  motivoRejeicao: string | null;
  criadoEm: string;
  paciente: {
    id: string;
    nome: string;
    email: string;
    cpf: string | null;
    perfilOnboarding: string | null;
  };
}

const TIPO_LABELS: Record<string, string> = {
  IDENTIDADE_FRENTE: 'Identidade (Frente)',
  IDENTIDADE_VERSO: 'Identidade (Verso)',
  SELFIE: 'Selfie',
  COMPROVANTE_ENDERECO: 'Comp. Endereco',
  PRESCRICAO: 'Prescricao',
  LAUDO_MEDICO: 'Laudo',
  AUTORIZACAO_ANVISA: 'ANVISA',
  OUTRO: 'Outro',
};

const STATUS_LABELS: Record<string, { label: string; cor: string }> = {
  ENVIADO: { label: 'Enviado', cor: 'blue' },
  EM_VALIDACAO: { label: 'Em Analise', cor: 'yellow' },
  APROVADO: { label: 'Aprovado', cor: 'green' },
  REJEITADO: { label: 'Rejeitado', cor: 'red' },
};

const MOTIVOS_REJEICAO = [
  'Documento ilegivel ou borrado',
  'Documento incompleto',
  'Documento expirado',
  'Documento nao corresponde ao tipo solicitado',
  'Dados do documento nao conferem com o cadastro',
  'Foto de selfie nao corresponde ao documento',
  'Assinatura ou carimbo medico ausente',
  'Outro',
];

export default function AdminDocumentosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<DocumentoRevisao[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>('ENVIADO');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [busca, setBusca] = useState('');
  const [modalRejeicao, setModalRejeicao] = useState<DocumentoRevisao | null>(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [motivoCustom, setMotivoCustom] = useState('');
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    carregarDocumentos();
  }, [filtroStatus, filtroTipo]);

  const carregarDocumentos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const params = new URLSearchParams();
      if (filtroStatus) params.append('status', filtroStatus);
      if (filtroTipo) params.append('tipo', filtroTipo);

      const response = await fetch(`/api/admin/documentos?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      setDocumentos(data.documentos || []);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const aprovarDocumento = async (doc: DocumentoRevisao) => {
    setProcessando(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/documentos/${doc.id}/aprovar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erro ao aprovar documento');

      toast.success('Documento aprovado!');
      carregarDocumentos();
    } catch (error) {
      toast.error('Erro ao aprovar documento');
    } finally {
      setProcessando(false);
    }
  };

  const rejeitarDocumento = async () => {
    if (!modalRejeicao) return;
    
    const motivo = motivoRejeicao === 'Outro' ? motivoCustom : motivoRejeicao;
    if (!motivo.trim()) {
      toast.error('Informe o motivo da rejeicao');
      return;
    }

    setProcessando(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/documentos/${modalRejeicao.id}/rejeitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivoRejeicao: motivo }),
      });

      if (!response.ok) throw new Error('Erro ao rejeitar documento');

      toast.success('Documento rejeitado');
      setModalRejeicao(null);
      setMotivoRejeicao('');
      setMotivoCustom('');
      carregarDocumentos();
    } catch (error) {
      toast.error('Erro ao rejeitar documento');
    } finally {
      setProcessando(false);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const documentosFiltrados = documentos.filter(doc => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      doc.paciente.nome.toLowerCase().includes(termo) ||
      doc.paciente.email.toLowerCase().includes(termo) ||
      (doc.paciente.cpf && doc.paciente.cpf.includes(termo))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-abracanm-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Revisao de Documentos</h1>
          <p className="text-gray-600 mt-1">Aprove ou rejeite documentos enviados pelos associados</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={filtroStatus}
                  onChange={e => setFiltroStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent bg-white"
                >
                  <option value="">Todos os Status</option>
                  <option value="ENVIADO">Enviados</option>
                  <option value="EM_VALIDACAO">Em Analise</option>
                  <option value="APROVADO">Aprovados</option>
                  <option value="REJEITADO">Rejeitados</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent bg-white"
                >
                  <option value="">Todos os Tipos</option>
                  {Object.entries(TIPO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'ENVIADO').length}
                </p>
                <p className="text-sm text-gray-500">Aguardando</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'EM_VALIDACAO').length}
                </p>
                <p className="text-sm text-gray-500">Em Analise</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'APROVADO').length}
                </p>
                <p className="text-sm text-gray-500">Aprovados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {documentos.filter(d => d.status === 'REJEITADO').length}
                </p>
                <p className="text-sm text-gray-500">Rejeitados</p>
              </div>
            </div>
          </div>
        </div>

        {documentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h2>
            <p className="text-gray-600">Ajuste os filtros ou aguarde novos envios.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Associado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documentosFiltrados.map(doc => {
                    const statusConfig = STATUS_LABELS[doc.status] || STATUS_LABELS.ENVIADO;
                    return (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{doc.paciente.nome}</p>
                              <p className="text-sm text-gray-500">{doc.paciente.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{TIPO_LABELS[doc.tipo] || doc.tipo}</p>
                            <p className="text-sm text-gray-500">Versao {doc.versao}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${statusConfig.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
                            ${statusConfig.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
                            ${statusConfig.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${statusConfig.cor === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                          `}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            {formatarData(doc.criadoEm)}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            {doc.url && (
                              <button
                                onClick={() => window.open(doc.url!, '_blank')}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Visualizar"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                            )}
                            {(doc.status === 'ENVIADO' || doc.status === 'EM_VALIDACAO') && (
                              <>
                                <button
                                  onClick={() => aprovarDocumento(doc)}
                                  disabled={processando}
                                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Aprovar"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setModalRejeicao(doc)}
                                  disabled={processando}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Rejeitar"
                                >
                                  <XCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalRejeicao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Rejeitar Documento</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Paciente:</strong> {modalRejeicao.paciente.nome}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Documento:</strong> {TIPO_LABELS[modalRejeicao.tipo]}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo da Rejeicao
              </label>
              <select
                value={motivoRejeicao}
                onChange={e => setMotivoRejeicao(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent"
              >
                <option value="">Selecione o motivo...</option>
                {MOTIVOS_REJEICAO.map(motivo => (
                  <option key={motivo} value={motivo}>{motivo}</option>
                ))}
              </select>
            </div>

            {motivoRejeicao === 'Outro' && (
              <div className="mb-4">
                <textarea
                  value={motivoCustom}
                  onChange={e => setMotivoCustom(e.target.value)}
                  placeholder="Descreva o motivo..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-abracanm-green focus:border-transparent resize-none"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalRejeicao(null);
                  setMotivoRejeicao('');
                  setMotivoCustom('');
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={rejeitarDocumento}
                disabled={processando || (!motivoRejeicao || (motivoRejeicao === 'Outro' && !motivoCustom.trim()))}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processando ? 'Rejeitando...' : 'Rejeitar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
