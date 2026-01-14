'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, fetchWithAdminAuth } from '@/lib/admin-auth-client';
import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  Building2,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Medico {
  id: string;
  usuarioId: string;
  nome: string;
  email: string;
  crm: string;
  especialidade: string;
  instituicao: string | null;
  telefone: string | null;
  whatsapp: string | null;
  fotoUrl: string | null;
  crmVerificado: boolean;
  dataVerificacao: string | null;
  usuarioAtivo: boolean;
  criadoEm: string;
  totalConsultas: number;
  totalPrescricoes: number;
  aceitaNovosPacientes: boolean;
  duracaoConsulta: number;
}

interface Stats {
  total: number;
  pendentes: number;
  aprovados: number;
}

export default function AdminMedicosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMedico, setSelectedMedico] = useState<Medico | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'aprovar' | 'rejeitar' | null>(null);
  const [motivo, setMotivo] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
  }, [router]);

  const loadMedicos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('status', filtroStatus);
      params.set('page', page.toString());
      if (busca) params.set('busca', busca);

      const data = await fetchWithAdminAuth<{
        medicos: Medico[];
        stats: Stats;
        pagination: { totalPages: number };
      }>(`/api/admin/medicos?${params}`);

      setMedicos(data.medicos || []);
      setStats(data.stats || null);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Erro ao carregar médicos:', err);
      toast.error('Erro ao carregar lista de médicos');
    } finally {
      setLoading(false);
    }
  }, [filtroStatus, page, busca]);

  useEffect(() => {
    loadMedicos();
  }, [loadMedicos]);

  const handleApproval = async () => {
    if (!selectedMedico || !approvalAction) return;

    try {
      setProcessing(true);
      await fetchWithAdminAuth(`/api/admin/medicos/${selectedMedico.id}/aprovar`, {
        method: 'POST',
        body: JSON.stringify({
          acao: approvalAction,
          motivo: approvalAction === 'rejeitar' ? motivo : undefined,
        }),
      });

      toast.success(
        approvalAction === 'aprovar'
          ? `Dr(a). ${selectedMedico.nome} aprovado com sucesso!`
          : `Dr(a). ${selectedMedico.nome} rejeitado`
      );

      setShowApprovalModal(false);
      setSelectedMedico(null);
      setApprovalAction(null);
      setMotivo('');
      loadMedicos();
    } catch (err) {
      console.error('Erro ao processar aprovação:', err);
      toast.error('Erro ao processar aprovação');
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalModal = (medico: Medico, action: 'aprovar' | 'rejeitar') => {
    setSelectedMedico(medico);
    setApprovalAction(action);
    setMotivo('');
    setShowApprovalModal(true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout title="Gestão de Médicos">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total de Médicos</p>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-700">Pendentes de Aprovação</p>
                  <p className="text-2xl font-bold text-amber-700">{stats?.pendentes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">Aprovados</p>
                  <p className="text-2xl font-bold text-green-700">{stats?.aprovados || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2">
                <Button
                  variant={filtroStatus === 'todos' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFiltroStatus('todos'); setPage(1); }}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroStatus === 'pendentes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFiltroStatus('pendentes'); setPage(1); }}
                  className={filtroStatus === 'pendentes' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  <Clock className="w-4 h-4 mr-1" />
                  Pendentes
                  {stats?.pendentes ? (
                    <Badge variant="secondary" className="ml-2 bg-white text-amber-700">
                      {stats.pendentes}
                    </Badge>
                  ) : null}
                </Button>
                <Button
                  variant={filtroStatus === 'aprovados' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setFiltroStatus('aprovados'); setPage(1); }}
                  className={filtroStatus === 'aprovados' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Aprovados
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, CRM ou especialidade..."
                  value={busca}
                  onChange={(e) => { setBusca(e.target.value); setPage(1); }}
                  className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-80 text-sm"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
              </div>
            ) : medicos.length === 0 ? (
              <div className="text-center py-12">
                <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nenhum médico encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicos.map((medico) => (
                  <motion.div
                    key={medico.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-verde-oliva/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {medico.fotoUrl ? (
                            <img
                              src={medico.fotoUrl}
                              alt={medico.nome}
                              className="w-14 h-14 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-7 h-7 text-verde-oliva" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">Dr(a). {medico.nome}</h3>
                            {medico.crmVerificado ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Aprovado
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                                <Clock className="w-3 h-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                            {!medico.usuarioAtivo && (
                              <Badge variant="destructive">Inativo</Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Shield className="w-4 h-4" />
                              CRM: {medico.crm}
                            </span>
                            <span className="flex items-center gap-1">
                              <Stethoscope className="w-4 h-4" />
                              {medico.especialidade}
                            </span>
                            {medico.instituicao && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                {medico.instituicao}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {medico.email}
                            </span>
                            {medico.whatsapp && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {medico.whatsapp}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-4 text-xs text-gray-400 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {medico.totalConsultas} consultas
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {medico.totalPrescricoes} prescrições
                            </span>
                            <span>Cadastro: {formatDate(medico.criadoEm)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {!medico.crmVerificado && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => openApprovalModal(medico, 'aprovar')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                              onClick={() => openApprovalModal(medico, 'rejeitar')}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeitar
                            </Button>
                          </>
                        )}
                        {medico.crmVerificado && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openApprovalModal(medico, 'rejeitar')}
                          >
                            Revogar Aprovação
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {showApprovalModal && selectedMedico && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApprovalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {approvalAction === 'aprovar' ? 'Aprovar Médico' : 'Rejeitar Médico'}
                </h3>
                <button onClick={() => setShowApprovalModal(false)}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium">Dr(a). {selectedMedico.nome}</p>
                  <p className="text-sm text-gray-600">CRM: {selectedMedico.crm}</p>
                  <p className="text-sm text-gray-600">{selectedMedico.especialidade}</p>
                </div>

                {approvalAction === 'aprovar' ? (
                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Confirmar Aprovação</p>
                      <p className="text-sm text-green-700">
                        O CRM deste médico será marcado como verificado e ele poderá
                        atender pacientes na plataforma.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Atenção</p>
                        <p className="text-sm text-red-700">
                          O médico será desativado e não poderá acessar a plataforma.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo da rejeição (opcional)
                      </label>
                      <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ex: CRM não encontrado no conselho..."
                        className="w-full p-3 border rounded-lg text-sm resize-none"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowApprovalModal(false)}
                    disabled={processing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className={`flex-1 ${
                      approvalAction === 'aprovar'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                    onClick={handleApproval}
                    disabled={processing}
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : approvalAction === 'aprovar' ? (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    {approvalAction === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
