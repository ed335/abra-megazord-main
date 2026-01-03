'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getToken, fetchWithAuth } from '@/lib/auth';
import { 
  User, 
  MapPin, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Check,
  Loader2,
  Upload,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const PATOLOGIAS_COMUNS = [
  { label: 'Epilepsia', cid: 'G40' },
  { label: 'Dor crônica', cid: 'R52.1' },
  { label: 'Transtorno de Ansiedade', cid: 'F41' },
  { label: 'Fibromialgia', cid: 'M79.7' },
  { label: 'Esclerose Múltipla', cid: 'G35' },
  { label: 'Doença de Parkinson', cid: 'G20' },
  { label: 'Transtorno do Espectro Autista', cid: 'F84.0' },
  { label: 'TDAH', cid: 'F90' },
  { label: 'Insônia', cid: 'G47.0' },
  { label: 'Artrite Reumatoide', cid: 'M06.9' },
  { label: 'Depressão', cid: 'F32' },
  { label: 'Outra (especificar)', cid: '' },
];

type FormData = {
  cpf: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  documentoIdentidadeUrl: string;
  patologiasSelecionadas: string[];
  patologiaPersonalizada: string;
  jaUsaCannabis: boolean;
};

const initialFormData: FormData = {
  cpf: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  documentoIdentidadeUrl: '',
  patologiasSelecionadas: [],
  patologiaPersonalizada: '',
  jaUsaCannabis: false,
};

function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10])) return false;
  
  return true;
}

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

const steps = [
  { id: 1, title: 'Dados Pessoais', icon: User },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Documentos', icon: FileText },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    fetchWithAuth<{ nome: string; onboardingCompleto: boolean }>('/api/auth/me')
      .then((data) => {
        setUserName(data.nome);
        if (data.onboardingCompleto) {
          router.replace('/dashboard');
        } else {
          fetchWithAuth<{
            cpf: string;
            cep: string;
            rua: string;
            numero: string;
            complemento: string;
            bairro: string;
            cidade: string;
            estado: string;
            documentoIdentidadeUrl: string;
            jaUsaCannabis: boolean;
            patologiaCID: string;
          }>('/api/perfil')
            .then((perfil) => {
              setFormData(prev => ({
                ...prev,
                cpf: perfil.cpf ? formatCPF(perfil.cpf) : '',
                cep: perfil.cep ? formatCEP(perfil.cep) : '',
                rua: perfil.rua || '',
                numero: perfil.numero || '',
                complemento: perfil.complemento || '',
                bairro: perfil.bairro || '',
                cidade: perfil.cidade || '',
                estado: perfil.estado || '',
                documentoIdentidadeUrl: perfil.documentoIdentidadeUrl || '',
                jaUsaCannabis: perfil.jaUsaCannabis || false,
              }));
            })
            .catch(() => {});
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const buscarCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setCepLoading(true);
    try {
      const response = await fetch(`/api/cep/${cleanCep}`);
      const data = await response.json();
      if (response.ok && !data.error) {
        setFormData(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setCepLoading(false);
    }
  };

  const handleDocumentoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    setUploadingDoc(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/upload/documento-identidade', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.success) {
        updateField('documentoIdentidadeUrl', data.data.url);
        toast.success('Documento enviado!');
      } else {
        toast.error(data.message || 'Erro ao enviar documento');
      }
    } catch {
      toast.error('Erro ao enviar documento');
    } finally {
      setUploadingDoc(false);
    }
  };

  const togglePatologia = (label: string) => {
    setFormData(prev => {
      const current = prev.patologiasSelecionadas;
      if (current.includes(label)) {
        return { ...prev, patologiasSelecionadas: current.filter(p => p !== label) };
      } else {
        return { ...prev, patologiasSelecionadas: [...current, label] };
      }
    });
  };

  const getPatologiaCID = (): string => {
    const patologias = formData.patologiasSelecionadas.map(label => {
      if (label === 'Outra (especificar)') {
        return formData.patologiaPersonalizada;
      }
      const patologia = PATOLOGIAS_COMUNS.find(p => p.label === label);
      return patologia ? `${patologia.label} (${patologia.cid})` : label;
    }).filter(Boolean);
    return patologias.join('; ');
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.cpf) {
          toast.error('CPF é obrigatório');
          return false;
        }
        if (!validateCPF(formData.cpf)) {
          toast.error('CPF inválido');
          return false;
        }
        return true;
      case 2:
        if (!formData.cep || !formData.rua || !formData.numero || !formData.cidade || !formData.estado) {
          toast.error('Preencha todos os campos de endereço');
          return false;
        }
        return true;
      case 3:
        if (!formData.documentoIdentidadeUrl) {
          toast.error('Envie um documento com foto');
          return false;
        }
        return true;
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const response = await fetchWithAuth('/api/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          cpf: formData.cpf.replace(/\D/g, ''),
          cep: formData.cep.replace(/\D/g, ''),
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          documentoIdentidadeUrl: formData.documentoIdentidadeUrl,
          jaUsaCannabis: formData.jaUsaCannabis,
          patologiaCID: getPatologiaCID(),
        }),
      });

      toast.success('Dados atualizados com sucesso!');
      router.push('/dashboard');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao atualizar dados';
      toast.error(msg);
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#3FA174] mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3FA174] focus:border-transparent transition-all";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-[#3FA174] font-semibold mb-2 inline-block">
            ABRACANM
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Olá, {userName.split(' ')[0]}!
          </h1>
          <p className="text-gray-600 mt-1">
            Complete seu cadastro para acessar todos os recursos
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  isCompleted ? 'bg-[#3FA174] text-white' :
                  isCurrent ? 'bg-[#3FA174]/10 text-[#3FA174] border-2 border-[#3FA174]' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-[#3FA174]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Dados Pessoais</h2>
                  <p className="text-sm text-gray-500">Informe seu CPF para validação</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CPF *</label>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className={inputClass}
                    maxLength={14}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Você já utiliza cannabis medicinal?</label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateField('jaUsaCannabis', true)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                        formData.jaUsaCannabis 
                          ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174]' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      type="button"
                      onClick={() => updateField('jaUsaCannabis', false)}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                        !formData.jaUsaCannabis 
                          ? 'border-[#3FA174] bg-[#3FA174]/5 text-[#3FA174]' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Condição de saúde (opcional)</label>
                  <div className="flex flex-wrap gap-2">
                    {PATOLOGIAS_COMUNS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => togglePatologia(p.label)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                          formData.patologiasSelecionadas.includes(p.label)
                            ? 'bg-[#3FA174] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {formData.patologiasSelecionadas.includes('Outra (especificar)') && (
                    <input
                      type="text"
                      value={formData.patologiaPersonalizada}
                      onChange={(e) => updateField('patologiaPersonalizada', e.target.value)}
                      placeholder="Descreva sua condição"
                      className={inputClass}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Endereço</h2>
                  <p className="text-sm text-gray-500">Informe seu endereço completo</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">CEP *</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => {
                        const formatted = formatCEP(e.target.value);
                        updateField('cep', formatted);
                        if (formatted.replace(/\D/g, '').length === 8) {
                          buscarCEP(formatted);
                        }
                      }}
                      placeholder="00000-000"
                      className={inputClass}
                      maxLength={9}
                    />
                    {cepLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium text-gray-700">Rua *</label>
                    <input
                      type="text"
                      value={formData.rua}
                      onChange={(e) => updateField('rua', e.target.value)}
                      placeholder="Nome da rua"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nº *</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => updateField('numero', e.target.value)}
                      placeholder="123"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Complemento</label>
                  <input
                    type="text"
                    value={formData.complemento}
                    onChange={(e) => updateField('complemento', e.target.value)}
                    placeholder="Apto, bloco, etc (opcional)"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => updateField('bairro', e.target.value)}
                      placeholder="Bairro"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Cidade *</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => updateField('cidade', e.target.value)}
                      placeholder="Cidade"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Estado *</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => updateField('estado', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecione</option>
                    {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Documento com foto</h2>
                  <p className="text-sm text-gray-500">Envie RG, CNH ou outro documento oficial</p>
                </div>

                <div className="space-y-4">
                  {formData.documentoIdentidadeUrl ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-800">Documento enviado</p>
                          <p className="text-sm text-green-600">Pronto para validação</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateField('documentoIdentidadeUrl', '')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#3FA174] hover:bg-[#3FA174]/5 transition-all">
                        {uploadingDoc ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#3FA174] mb-2" />
                            <p className="text-gray-600">Enviando...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-600 font-medium">Clique para enviar</p>
                            <p className="text-sm text-gray-400 mt-1">PNG, JPG ou PDF até 10MB</p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleDocumentoUpload}
                        className="hidden"
                        disabled={uploadingDoc}
                      />
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft size={18} />
                Voltar
              </Button>
            ) : (
              <Link href="/dashboard">
                <Button variant="ghost" className="text-gray-500">
                  Pular por agora
                </Button>
              </Link>
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-[#3FA174] hover:bg-[#359966] flex items-center gap-2"
              >
                Continuar
                <ChevronRight size={18} />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-[#3FA174] hover:bg-[#359966]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Finalizar cadastro'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
