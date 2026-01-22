'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  File,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/shared/Header';
import { toast, Toaster } from 'react-hot-toast';

interface Documento {
  id: string;
  tipo: string;
  status: string;
  url: string | null;
  nomeArquivo: string | null;
  dataEmissao: string | null;
  dataValidade: string | null;
  versao: number;
  motivoRejeicao: string | null;
  criadoEm: string;
}

const TIPO_LABELS: Record<string, string> = {
  IDENTIDADE_FRENTE: 'Documento de Identidade (Frente)',
  IDENTIDADE_VERSO: 'Documento de Identidade (Verso)',
  SELFIE: 'Selfie com Documento',
  COMPROVANTE_ENDERECO: 'Comprovante de Endereco',
  PRESCRICAO: 'Prescricao Medica',
  LAUDO_MEDICO: 'Laudo Medico',
  AUTORIZACAO_ANVISA: 'Autorizacao ANVISA',
  OUTRO: 'Outro Documento',
};

const STATUS_CONFIG: Record<string, { label: string; cor: string; icone: any }> = {
  PENDENTE: { label: 'Pendente', cor: 'gray', icone: Clock },
  ENVIADO: { label: 'Enviado', cor: 'blue', icone: Upload },
  EM_VALIDACAO: { label: 'Em Analise', cor: 'yellow', icone: Clock },
  APROVADO: { label: 'Aprovado', cor: 'green', icone: CheckCircle },
  REJEITADO: { label: 'Rejeitado', cor: 'red', icone: XCircle },
  EXPIRADO: { label: 'Expirado', cor: 'orange', icone: AlertCircle },
};

export default function MinhaPastaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);

  useEffect(() => {
    carregarDocumentos();
  }, []);

  const carregarDocumentos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/onboarding/documentos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      setDocumentos(data.documentos || []);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast.error('Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (tipo: string, file: File) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tipo', tipo);

      const response = await fetch('/api/onboarding/documentos', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao enviar documento');
      }

      toast.success('Documento enviado com sucesso!');
      carregarDocumentos();
      setSelectedTipo(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documento');
    } finally {
      setUploading(false);
    }
  };

  const formatarData = (dataString: string | null) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const getDocumentoIcon = (tipo: string) => {
    if (tipo.includes('IDENTIDADE') || tipo === 'SELFIE') {
      return ImageIcon;
    }
    return FileText;
  };

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
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Minha Pasta</h1>
          <p className="text-gray-600 mt-1">Gerencie seus documentos em um so lugar</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800">
                Seus documentos sao armazenados de forma segura e criptografada, em conformidade com a LGPD.
              </p>
            </div>
          </div>
        </div>

        {documentos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento</h2>
            <p className="text-gray-600 mb-6">
              Voce ainda nao enviou nenhum documento. Complete seu cadastro para enviar.
            </p>
            <button
              onClick={() => router.push('/associar?etapa=3')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-abracanm-green text-white rounded-lg font-medium hover:bg-abracanm-green-dark transition-colors"
            >
              <Upload className="w-5 h-5" />
              Enviar Documentos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documentos.map(doc => {
              const StatusIcon = STATUS_CONFIG[doc.status]?.icone || Clock;
              const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.PENDENTE;
              const DocIcon = getDocumentoIcon(doc.tipo);

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      ${statusConfig.cor === 'green' ? 'bg-green-100' : ''}
                      ${statusConfig.cor === 'red' ? 'bg-red-100' : ''}
                      ${statusConfig.cor === 'yellow' ? 'bg-yellow-100' : ''}
                      ${statusConfig.cor === 'blue' ? 'bg-blue-100' : ''}
                      ${statusConfig.cor === 'gray' ? 'bg-gray-100' : ''}
                      ${statusConfig.cor === 'orange' ? 'bg-orange-100' : ''}
                    `}>
                      <DocIcon className={`w-6 h-6
                        ${statusConfig.cor === 'green' ? 'text-green-600' : ''}
                        ${statusConfig.cor === 'red' ? 'text-red-600' : ''}
                        ${statusConfig.cor === 'yellow' ? 'text-yellow-600' : ''}
                        ${statusConfig.cor === 'blue' ? 'text-blue-600' : ''}
                        ${statusConfig.cor === 'gray' ? 'text-gray-600' : ''}
                        ${statusConfig.cor === 'orange' ? 'text-orange-600' : ''}
                      `} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">
                          {TIPO_LABELS[doc.tipo] || doc.tipo}
                        </h3>
                        <div className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${statusConfig.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
                          ${statusConfig.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
                          ${statusConfig.cor === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${statusConfig.cor === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                          ${statusConfig.cor === 'gray' ? 'bg-gray-100 text-gray-700' : ''}
                          ${statusConfig.cor === 'orange' ? 'bg-orange-100 text-orange-700' : ''}
                        `}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusConfig.label}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        {doc.nomeArquivo && (
                          <span className="flex items-center gap-1">
                            <File className="w-4 h-4" />
                            {doc.nomeArquivo}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Enviado em {formatarData(doc.criadoEm)}
                        </span>
                        {doc.versao > 1 && (
                          <span className="flex items-center gap-1">
                            <RefreshCw className="w-4 h-4" />
                            Versao {doc.versao}
                          </span>
                        )}
                      </div>

                      {doc.dataValidade && (
                        <p className="mt-2 text-sm text-gray-500">
                          Validade: {formatarData(doc.dataValidade)}
                        </p>
                      )}

                      {doc.status === 'REJEITADO' && doc.motivoRejeicao && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-sm text-red-700">
                            <strong>Motivo da rejeicao:</strong> {doc.motivoRejeicao}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {doc.url && (
                        <button
                          onClick={() => window.open(doc.url!, '_blank')}
                          className="p-2 text-gray-500 hover:text-abracanm-green hover:bg-gray-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      {(doc.status === 'REJEITADO' || doc.status === 'EXPIRADO') && (
                        <label className="p-2 text-gray-500 hover:text-abracanm-green hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                          <RefreshCw className="w-5 h-5" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(doc.tipo, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/associar?etapa=3')}
            className="inline-flex items-center gap-2 text-abracanm-green hover:underline"
          >
            <Upload className="w-5 h-5" />
            Enviar novo documento
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
