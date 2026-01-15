'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  ArrowLeft, 
  FileText,
  Save,
  Download,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';

interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
}

function MedicoPrescricaoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const consultaId = searchParams.get('consulta');
  const pacienteId = searchParams.get('paciente');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [prescricaoSalva, setPrescricaoSalva] = useState(false);
  
  const [formData, setFormData] = useState({
    medicamento: '',
    forma: 'Óleo Full Spectrum',
    concentracao: '',
    posologia: '',
    quantidade: '',
    duracao: '30 dias',
    observacoes: '',
    cid: '',
    orientacoes: `- Iniciar com dose baixa e aumentar gradualmente conforme tolerância
- Administrar preferencialmente à noite nas primeiras semanas
- Manter em local fresco e ao abrigo da luz
- Em caso de efeitos adversos, suspender o uso e entrar em contato`,
  });

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login-medico');
      return;
    }

    if (!pacienteId) {
      toast.error('Paciente não especificado');
      router.replace('/medico/consultas');
      return;
    }

    const fetchPaciente = async () => {
      try {
        const response = await fetchWithMedicoAuth<{ paciente: Paciente }>(
          `/api/medico/paciente/${pacienteId}`
        );
        setPaciente(response.paciente);
      } catch (err) {
        console.error('Erro ao carregar paciente:', err);
        toast.error('Erro ao carregar dados do paciente');
      } finally {
        setLoading(false);
      }
    };

    fetchPaciente();
  }, [router, pacienteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.medicamento || !formData.posologia) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      
      await fetchWithMedicoAuth('/api/medico/prescricao', {
        method: 'POST',
        body: JSON.stringify({
          pacienteId,
          consultaId,
          ...formData,
        }),
      });

      toast.success('Prescrição salva com sucesso!');
      setPrescricaoSalva(true);
    } catch (err) {
      console.error('Erro ao salvar prescrição:', err);
      toast.error('Erro ao salvar prescrição');
    } finally {
      setSaving(false);
    }
  };

  const formasFarmaceuticas = [
    'Óleo Full Spectrum',
    'Óleo Broad Spectrum',
    'Óleo Isolado CBD',
    'Cápsula',
    'Tintura',
    'Creme/Pomada',
    'Spray Sublingual',
    'Flor Seca (Vaporização)',
  ];

  const duracoes = [
    '15 dias',
    '30 dias',
    '60 dias',
    '90 dias',
  ];

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </MedicoLayout>
    );
  }

  if (prescricaoSalva) {
    return (
      <MedicoLayout>
        <div className="max-w-md mx-auto mt-20">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Prescrição Emitida
              </h2>
              <p className="text-gray-600 mb-6">
                A prescrição para {paciente?.nome} foi salva com sucesso.
              </p>
              
              <div className="space-y-3">
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                
                <Link href="/medico" className="block">
                  <Button className="w-full bg-verde-oliva hover:bg-verde-oliva/90">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </MedicoLayout>
    );
  }

  return (
    <MedicoLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/medico/consultas">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nova Prescrição</h1>
            <p className="text-gray-500">Emitir prescrição de cannabis medicinal</p>
          </div>
        </div>

        {paciente && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-verde-oliva/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-verde-oliva" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{paciente.nome}</p>
                  <p className="text-sm text-gray-500">
                    CPF: {paciente.cpf || 'Não informado'} | 
                    Nascimento: {paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-verde-oliva" />
                Dados da Prescrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medicamento / Produto *
                  </label>
                  <input
                    type="text"
                    value={formData.medicamento}
                    onChange={(e) => setFormData({ ...formData, medicamento: e.target.value })}
                    placeholder="Ex: Cannabis Sativa - CBD 20mg/ml"
                    className="w-full p-3 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma Farmacêutica
                  </label>
                  <select
                    value={formData.forma}
                    onChange={(e) => setFormData({ ...formData, forma: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    {formasFarmaceuticas.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Concentração
                  </label>
                  <input
                    type="text"
                    value={formData.concentracao}
                    onChange={(e) => setFormData({ ...formData, concentracao: e.target.value })}
                    placeholder="Ex: CBD 20mg/ml + THC 1mg/ml"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="text"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    placeholder="Ex: 1 frasco de 30ml"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CID (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.cid}
                    onChange={(e) => setFormData({ ...formData, cid: e.target.value })}
                    placeholder="Ex: G40.9 - Epilepsia"
                    className="w-full p-3 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração do Tratamento
                  </label>
                  <select
                    value={formData.duracao}
                    onChange={(e) => setFormData({ ...formData, duracao: e.target.value })}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    {duracoes.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Posologia *
                </label>
                <textarea
                  value={formData.posologia}
                  onChange={(e) => setFormData({ ...formData, posologia: e.target.value })}
                  placeholder="Ex: Iniciar com 5 gotas (10mg CBD) via sublingual, 2x ao dia. Aumentar 2 gotas a cada 3 dias até atingir efeito terapêutico desejado. Dose máxima: 20 gotas 2x ao dia."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orientações ao Paciente
                </label>
                <textarea
                  value={formData.orientacoes}
                  onChange={(e) => setFormData({ ...formData, orientacoes: e.target.value })}
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações Adicionais
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais sobre o tratamento..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Atenção</p>
                  <p>
                    Esta prescrição será emitida em conformidade com a RDC 660/2022 da ANVISA.
                    Certifique-se de que todos os dados estão corretos antes de salvar.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/medico/consultas" className="flex-1">
                  <Button variant="outline" className="w-full" type="button">
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="flex-1 bg-verde-oliva hover:bg-verde-oliva/90"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Prescrição
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </MedicoLayout>
  );
}

export default function MedicoPrescricaoPage() {
  return (
    <Suspense fallback={
      <MedicoLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </MedicoLayout>
    }>
      <MedicoPrescricaoContent />
    </Suspense>
  );
}
