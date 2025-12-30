'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Building2, User, MapPin, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  whatsapp: string;
  website: string;
  responsavelNome: string;
  responsavelCpf: string;
  responsavelEmail: string;
  responsavelTelefone: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  documentoUrl: string;
  termoUso: boolean;
  consenteLGPD: boolean;
}

export default function CadastroInstitutoClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    email: '',
    telefone: '',
    whatsapp: '',
    website: '',
    responsavelNome: '',
    responsavelCpf: '',
    responsavelEmail: '',
    responsavelTelefone: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    documentoUrl: '',
    termoUso: false,
    consenteLGPD: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    return digits.replace(/(\d{5})(\d{0,3})/, '$1-$2');
  };

  const handleCepBlur = async () => {
    const cepDigits = formData.cep.replace(/\D/g, '');
    if (cepDigits.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
        const data = await response.json();
        if (!data.erro) {
          updateField('rua', data.logradouro || '');
          updateField('bairro', data.bairro || '');
          updateField('cidade', data.localidade || '');
          updateField('estado', data.uf || '');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleDocumentoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        updateField('documentoUrl', data.data.url);
      } else {
        setMessage(data.message || 'Erro ao enviar documento');
      }
    } catch {
      setMessage('Erro ao enviar documento');
    }
    setUploadingDoc(false);
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.razaoSocial.trim()) errors.razaoSocial = 'Razão social é obrigatória';
      if (!formData.nomeFantasia.trim()) errors.nomeFantasia = 'Nome fantasia é obrigatório';
      if (!formData.cnpj.trim()) errors.cnpj = 'CNPJ é obrigatório';
      if (!formData.email.trim()) errors.email = 'E-mail é obrigatório';
      if (!formData.whatsapp.trim()) errors.whatsapp = 'WhatsApp é obrigatório';
    }

    if (step === 2) {
      if (!formData.responsavelNome.trim()) errors.responsavelNome = 'Nome do responsável é obrigatório';
      if (!formData.responsavelEmail.trim()) errors.responsavelEmail = 'E-mail do responsável é obrigatório';
    }

    if (step === 3) {
      if (!formData.cep.trim()) errors.cep = 'CEP é obrigatório';
      if (!formData.cidade.trim()) errors.cidade = 'Cidade é obrigatória';
      if (!formData.estado.trim()) errors.estado = 'Estado é obrigatório';
    }

    if (step === 4) {
      if (!formData.termoUso) errors.termoUso = 'Aceite os termos de uso';
      if (!formData.consenteLGPD) errors.consenteLGPD = 'Aceite a política de privacidade';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/cadastro/instituto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        router.push('/cadastro/sucesso?tipo=instituto');
      } else {
        setStatus('error');
        setMessage(data.message || 'Erro ao realizar cadastro');
      }
    } catch {
      setStatus('error');
      setMessage('Erro ao conectar com o servidor');
    }
  };

  const steps = [
    { id: 1, title: 'Dados do Instituto', icon: Building2 },
    { id: 2, title: 'Responsável', icon: User },
    { id: 3, title: 'Endereço', icon: MapPin },
    { id: 4, title: 'Confirmação', icon: Check },
  ];

  const inputClass = 'w-full px-4 py-3 border border-cinza-claro rounded-lg focus:outline-none focus:ring-2 focus:ring-verde-oliva/30 focus:border-verde-oliva transition-all';
  const labelClass = 'text-sm font-medium text-cinza-escuro';

  const slideVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 }),
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link 
              href="/cadastro" 
              className="inline-flex items-center gap-1 text-sm text-cinza-medio hover:text-verde-oliva transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </Link>
            <span className="block text-verde-oliva text-sm font-medium tracking-wide uppercase">
              ABRACANM
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-cinza-escuro tracking-tight">
              Cadastro de Instituto
            </h1>
            <p className="text-sm text-cinza-medio mt-1">
              Cadastre sua clínica ou centro médico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-verde-oliva text-white' 
                      : isCompleted 
                        ? 'bg-verde-claro text-verde-oliva' 
                        : 'bg-cinza-claro text-cinza-medio'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    isCompleted ? 'bg-verde-oliva' : 'bg-cinza-claro'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        <Card className="border-cinza-claro">
          <CardContent className="p-6">
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Dados do Instituto</h2>
                  
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Razão Social *</span>
                    <input
                      type="text"
                      value={formData.razaoSocial}
                      onChange={(e) => updateField('razaoSocial', e.target.value)}
                      className={inputClass}
                      placeholder="Razão social completa"
                    />
                    {fieldErrors.razaoSocial && <span className="text-xs text-red-500">{fieldErrors.razaoSocial}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Nome Fantasia *</span>
                    <input
                      type="text"
                      value={formData.nomeFantasia}
                      onChange={(e) => updateField('nomeFantasia', e.target.value)}
                      className={inputClass}
                      placeholder="Nome fantasia"
                    />
                    {fieldErrors.nomeFantasia && <span className="text-xs text-red-500">{fieldErrors.nomeFantasia}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>CNPJ *</span>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => updateField('cnpj', formatCNPJ(e.target.value))}
                      className={inputClass}
                      placeholder="00.000.000/0000-00"
                    />
                    {fieldErrors.cnpj && <span className="text-xs text-red-500">{fieldErrors.cnpj}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>E-mail Institucional *</span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={inputClass}
                      placeholder="contato@instituto.com.br"
                    />
                    {fieldErrors.email && <span className="text-xs text-red-500">{fieldErrors.email}</span>}
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Telefone</span>
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => updateField('telefone', formatPhone(e.target.value))}
                        className={inputClass}
                        placeholder="(00) 0000-0000"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>WhatsApp *</span>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => updateField('whatsapp', formatPhone(e.target.value))}
                        className={inputClass}
                        placeholder="(00) 00000-0000"
                      />
                      {fieldErrors.whatsapp && <span className="text-xs text-red-500">{fieldErrors.whatsapp}</span>}
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Website (opcional)</span>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      className={inputClass}
                      placeholder="https://www.instituto.com.br"
                    />
                  </label>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Responsável Legal</h2>
                  
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Nome Completo *</span>
                    <input
                      type="text"
                      value={formData.responsavelNome}
                      onChange={(e) => updateField('responsavelNome', e.target.value)}
                      className={inputClass}
                      placeholder="Nome do responsável"
                    />
                    {fieldErrors.responsavelNome && <span className="text-xs text-red-500">{fieldErrors.responsavelNome}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>CPF</span>
                    <input
                      type="text"
                      value={formData.responsavelCpf}
                      onChange={(e) => updateField('responsavelCpf', formatCPF(e.target.value))}
                      className={inputClass}
                      placeholder="000.000.000-00"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>E-mail do Responsável *</span>
                    <input
                      type="email"
                      value={formData.responsavelEmail}
                      onChange={(e) => updateField('responsavelEmail', e.target.value)}
                      className={inputClass}
                      placeholder="responsavel@email.com"
                    />
                    {fieldErrors.responsavelEmail && <span className="text-xs text-red-500">{fieldErrors.responsavelEmail}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Telefone do Responsável</span>
                    <input
                      type="tel"
                      value={formData.responsavelTelefone}
                      onChange={(e) => updateField('responsavelTelefone', formatPhone(e.target.value))}
                      className={inputClass}
                      placeholder="(00) 00000-0000"
                    />
                  </label>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-cinza-escuro mb-3">Documento (Contrato Social, Estatuto)</h3>
                    <div className="border-2 border-dashed border-cinza-claro rounded-lg p-6 text-center">
                      {formData.documentoUrl ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center gap-2 text-sucesso">
                            <Check className="w-6 h-6" />
                            <span className="font-medium">Documento enviado!</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateField('documentoUrl', '')}
                            className="text-sm text-erro hover:underline"
                          >
                            Remover
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="space-y-2">
                            <FileText className="w-12 h-12 mx-auto text-cinza-medio" />
                            <p className="text-cinza-medio">
                              {uploadingDoc ? 'Enviando...' : 'Clique para selecionar (opcional)'}
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,image/*"
                            onChange={handleDocumentoUpload}
                            className="hidden"
                            disabled={uploadingDoc}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Endereço</h2>
                  
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>CEP *</span>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => updateField('cep', formatCEP(e.target.value))}
                      onBlur={handleCepBlur}
                      className={inputClass}
                      placeholder="00000-000"
                    />
                    {fieldErrors.cep && <span className="text-xs text-red-500">{fieldErrors.cep}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Rua</span>
                    <input
                      type="text"
                      value={formData.rua}
                      onChange={(e) => updateField('rua', e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Número</span>
                      <input
                        type="text"
                        value={formData.numero}
                        onChange={(e) => updateField('numero', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 col-span-2">
                      <span className={labelClass}>Complemento</span>
                      <input
                        type="text"
                        value={formData.complemento}
                        onChange={(e) => updateField('complemento', e.target.value)}
                        className={inputClass}
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Bairro</span>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => updateField('bairro', e.target.value)}
                      className={inputClass}
                    />
                  </label>

                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex flex-col gap-1.5 col-span-2">
                      <span className={labelClass}>Cidade *</span>
                      <input
                        type="text"
                        value={formData.cidade}
                        onChange={(e) => updateField('cidade', e.target.value)}
                        className={inputClass}
                      />
                      {fieldErrors.cidade && <span className="text-xs text-red-500">{fieldErrors.cidade}</span>}
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className={labelClass}>Estado *</span>
                      <input
                        type="text"
                        value={formData.estado}
                        onChange={(e) => updateField('estado', e.target.value.toUpperCase())}
                        className={inputClass}
                        maxLength={2}
                      />
                      {fieldErrors.estado && <span className="text-xs text-red-500">{fieldErrors.estado}</span>}
                    </label>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Confirmação</h2>
                  
                  <div className="bg-verde-claro/10 rounded-lg p-4 space-y-2">
                    <p className="font-medium text-cinza-escuro">{formData.nomeFantasia}</p>
                    <p className="text-sm text-cinza-medio">CNPJ: {formData.cnpj}</p>
                    <p className="text-sm text-cinza-medio">{formData.email}</p>
                    <p className="text-sm text-cinza-medio">Responsável: {formData.responsavelNome}</p>
                    <p className="text-sm text-cinza-medio">{formData.cidade}/{formData.estado}</p>
                  </div>

                  <div className="bg-alerta/10 border border-alerta/30 rounded-lg p-4">
                    <p className="text-sm text-alerta">
                      Seu cadastro será analisado pela nossa equipe. Você receberá uma confirmação por e-mail em até 48 horas.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.termoUso}
                        onChange={(e) => updateField('termoUso', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-cinza-claro text-verde-oliva focus:ring-verde-oliva"
                      />
                      <span className="text-sm text-cinza-medio">
                        Li e aceito os{' '}
                        <Link href="/termos-de-uso" className="text-verde-oliva hover:underline">
                          Termos de Uso
                        </Link>
                      </span>
                    </label>
                    {fieldErrors.termoUso && <span className="text-xs text-red-500 ml-8">{fieldErrors.termoUso}</span>}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.consenteLGPD}
                        onChange={(e) => updateField('consenteLGPD', e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-cinza-claro text-verde-oliva focus:ring-verde-oliva"
                      />
                      <span className="text-sm text-cinza-medio">
                        Consinto com a{' '}
                        <Link href="/politica-de-privacidade" className="text-verde-oliva hover:underline">
                          Política de Privacidade
                        </Link>
                      </span>
                    </label>
                    {fieldErrors.consenteLGPD && <span className="text-xs text-red-500 ml-8">{fieldErrors.consenteLGPD}</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                status === 'success' ? 'bg-sucesso/10 text-sucesso' :
                status === 'error' ? 'bg-erro/10 text-erro' :
                'bg-alerta/10 text-alerta'
              }`}>
                {message}
              </div>
            )}

            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Enviando...' : 'Enviar Cadastro'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
