'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Save,
  User,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { getMedicoToken, fetchWithMedicoAuth } from '@/lib/medico-auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import MedicoLayout from '@/components/layout/MedicoLayout';

interface PerfilMedico {
  id: string;
  nome: string;
  especialidade: string;
  especialidades: string[];
  crm: string;
  fotoUrl: string | null;
  bio: string | null;
  experiencia: string | null;
  consultaValor: number | null;
  duracaoConsulta: number;
  intervaloConsultas: number;
  marketplaceVisible: boolean;
  aceitaNovosPacientes: boolean;
  crmVerificado: boolean;
}

export default function MedicoConfiguracoesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<PerfilMedico | null>(null);
  
  const [formData, setFormData] = useState({
    bio: '',
    experiencia: '',
    especialidades: [] as string[],
    consultaValor: '',
    duracaoConsulta: 30,
    intervaloConsultas: 10,
    marketplaceVisible: false,
    aceitaNovosPacientes: true,
  });

  const [novaEspecialidade, setNovaEspecialidade] = useState('');

  useEffect(() => {
    const token = getMedicoToken();
    if (!token) {
      router.replace('/login-medico');
      return;
    }
    fetchPerfil();
  }, [router]);

  const fetchPerfil = async () => {
    try {
      const response = await fetchWithMedicoAuth<{ perfil: PerfilMedico }>(
        '/api/medico/perfil'
      );
      setPerfil(response.perfil);
      setFormData({
        bio: response.perfil.bio || '',
        experiencia: response.perfil.experiencia || '',
        especialidades: response.perfil.especialidades || [],
        consultaValor: response.perfil.consultaValor?.toString() || '',
        duracaoConsulta: response.perfil.duracaoConsulta,
        intervaloConsultas: response.perfil.intervaloConsultas,
        marketplaceVisible: response.perfil.marketplaceVisible,
        aceitaNovosPacientes: response.perfil.aceitaNovosPacientes,
      });
    } catch (err: any) {
      if (err?.code === 'UNAUTHORIZED') {
        router.replace('/login-medico');
        return;
      }
      toast.error('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.marketplaceVisible && !formData.consultaValor) {
      toast.error('Defina um valor para a consulta antes de aparecer no marketplace');
      return;
    }

    try {
      setSaving(true);
      
      await fetchWithMedicoAuth('/api/medico/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          ...formData,
          consultaValor: formData.consultaValor ? parseFloat(formData.consultaValor) : null,
        }),
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAddEspecialidade = () => {
    if (novaEspecialidade && !formData.especialidades.includes(novaEspecialidade)) {
      setFormData({
        ...formData,
        especialidades: [...formData.especialidades, novaEspecialidade],
      });
      setNovaEspecialidade('');
    }
  };

  const handleRemoveEspecialidade = (esp: string) => {
    setFormData({
      ...formData,
      especialidades: formData.especialidades.filter(e => e !== esp),
    });
  };

  if (loading) {
    return (
      <MedicoLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
        </div>
      </MedicoLayout>
    );
  }

  return (
    <MedicoLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Perfil</h1>
          <p className="text-gray-500">Configure seu perfil público e valores de consulta</p>
        </div>

        {!perfil?.crmVerificado && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">CRM em análise</p>
              <p className="text-sm text-amber-700">
                Seu CRM está sendo verificado. Você poderá aparecer no marketplace após a aprovação.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-verde-oliva" />
                Perfil Público
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sobre você (Bio)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre sua experiência e abordagem..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Experiência
                </label>
                <input
                  type="text"
                  value={formData.experiencia}
                  onChange={(e) => setFormData({ ...formData, experiencia: e.target.value })}
                  placeholder="Ex: 10 anos de experiência"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Especialidades adicionais
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={novaEspecialidade}
                    onChange={(e) => setNovaEspecialidade(e.target.value)}
                    placeholder="Ex: Dor Crônica"
                    className="flex-1 p-3 border rounded-lg"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEspecialidade())}
                  />
                  <Button type="button" onClick={handleAddEspecialidade} variant="outline">
                    Adicionar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.especialidades.map((esp) => (
                    <Badge 
                      key={esp} 
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100"
                      onClick={() => handleRemoveEspecialidade(esp)}
                    >
                      {esp} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-verde-oliva" />
                Valor da Consulta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor da consulta avulsa (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.consultaValor}
                    onChange={(e) => setFormData({ ...formData, consultaValor: e.target.value })}
                    placeholder="0,00"
                    className="w-full p-3 pl-10 border rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Este é o valor que os pacientes pagarão pela consulta avulsa
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duração da consulta (min)
                  </label>
                  <select
                    value={formData.duracaoConsulta}
                    onChange={(e) => setFormData({ ...formData, duracaoConsulta: parseInt(e.target.value) })}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalo entre consultas (min)
                  </label>
                  <select
                    value={formData.intervaloConsultas}
                    onChange={(e) => setFormData({ ...formData, intervaloConsultas: parseInt(e.target.value) })}
                    className="w-full p-3 border rounded-lg bg-white"
                  >
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-verde-oliva" />
                Visibilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  {formData.marketplaceVisible ? (
                    <Eye className="w-5 h-5 text-verde-oliva" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">Aparecer no Marketplace</p>
                    <p className="text-sm text-gray-500">
                      Pacientes poderão encontrar você na busca de médicos
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.marketplaceVisible}
                  onChange={(e) => setFormData({ ...formData, marketplaceVisible: e.target.checked })}
                  disabled={!perfil?.crmVerificado}
                  className="w-5 h-5 text-verde-oliva rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Aceitar novos pacientes</p>
                    <p className="text-sm text-gray-500">
                      Permitir que novos pacientes agendem consultas
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.aceitaNovosPacientes}
                  onChange={(e) => setFormData({ ...formData, aceitaNovosPacientes: e.target.checked })}
                  className="w-5 h-5 text-verde-oliva rounded"
                />
              </label>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              className="flex-1 bg-verde-oliva hover:bg-verde-oliva/90 py-3"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </MedicoLayout>
  );
}
