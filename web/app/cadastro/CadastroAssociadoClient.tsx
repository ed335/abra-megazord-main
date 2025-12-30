'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Clock3, CheckCircle2, User, MapPin, FileText, Stethoscope, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { setToken } from '@/lib/auth';

const STORAGE_KEY = 'abracanm_cadastro_form';
const STORAGE_STEP_KEY = 'abracanm_cadastro_step';

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
  { label: 'Dor Oncológica', cid: 'C80' },
  { label: 'Depressão', cid: 'F32' },
  { label: 'Transtorno de Estresse Pós-Traumático', cid: 'F43.1' },
  { label: 'Síndrome de Tourette', cid: 'F95.2' },
  { label: 'Alzheimer', cid: 'G30' },
  { label: 'Outra (especificar)', cid: '' },
];

type FormData = {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  whatsapp: string;
  termoAjuizamento: boolean;
  termoConsentimento: boolean;
  termoPoliticaPrivacidade: boolean;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  documentoIdentidadeUrl: string;
  jaUsaCannabis: boolean;
  patologiasSelecionadas: string[];
  patologiaPersonalizada: string;
  documentosMedicosUrls: string[];
};

const initialFormData: FormData = {
  nome: '',
  cpf: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  whatsapp: '',
  termoAjuizamento: false,
  termoConsentimento: false,
  termoPoliticaPrivacidade: false,
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  documentoIdentidadeUrl: '',
  jaUsaCannabis: false,
  patologiasSelecionadas: [],
  patologiaPersonalizada: '',
  documentosMedicosUrls: [],
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

const steps = [
  { id: 1, title: 'Dados e Termos', icon: User },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Documento', icon: FileText },
  { id: 4, title: 'Informações Médicas', icon: Stethoscope },
];

type FieldErrors = {
  [K in keyof FormData]?: string;
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export default function CadastroAssociadoClient() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingMedicos, setUploadingMedicos] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [restoredFields, setRestoredFields] = useState<string[]>([]);
  const router = useRouter();
  
  const totalSteps = steps.length;
  const progress = Math.round((currentStep / totalSteps) * 100);

  useEffect(() => {
    try {
      const savedForm = localStorage.getItem(STORAGE_KEY);
      const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
      if (savedForm) {
        const parsed = JSON.parse(savedForm);
        setFormData({ ...initialFormData, ...parsed });
        
        const fieldLabels: Record<string, string> = {
          nome: 'Nome',
          email: 'E-mail',
          cpf: 'CPF',
          whatsapp: 'WhatsApp',
          cep: 'CEP',
          rua: 'Rua',
          numero: 'Número',
          bairro: 'Bairro',
          cidade: 'Cidade',
          estado: 'Estado',
        };
        
        const filledFields = Object.entries(parsed)
          .filter(([key, value]) => value && typeof value === 'string' && value.trim() !== '' && fieldLabels[key])
          .map(([key]) => fieldLabels[key]);
        
        if (filledFields.length > 0) {
          setHasRestoredData(true);
          setRestoredFields(filledFields);
        }
      }
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      }
    } catch (e) {
      console.error('Erro ao carregar dados salvos:', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
      } catch (e) {
        console.error('Erro ao salvar dados:', e);
      }
    }
  }, [formData, currentStep, isLoaded]);

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatNome = (value: string) => {
    const preposicoes = ['de', 'da', 'do', 'das', 'dos', 'e'];
    return value
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index > 0 && preposicoes.includes(word)) {
          return word;
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

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

  const preventPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    setMessage('Por segurança, digite a senha novamente sem copiar e colar.');
  };

  const handleDocumentoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage('Arquivo muito grande. Máximo 10MB.');
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
        setMessage('');
      } else {
        setMessage(data.message || 'Erro ao enviar documento');
      }
    } catch (error) {
      setMessage('Erro ao enviar documento');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDocumentosMedicosUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 5) {
      setMessage('Máximo de 5 arquivos permitidos.');
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('Um ou mais arquivos excedem 10MB.');
        return;
      }
    }

    setUploadingMedicos(true);
    const formDataUpload = new FormData();
    Array.from(files).forEach(file => formDataUpload.append('files', file));

    try {
      const response = await fetch('/api/upload/documentos-medicos', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await response.json();
      if (data.success) {
        updateField('documentosMedicosUrls', data.data.urls);
        setMessage('');
      } else {
        setMessage(data.message || 'Erro ao enviar documentos médicos');
      }
    } catch (error) {
      setMessage('Erro ao enviar documentos médicos');
    } finally {
      setUploadingMedicos(false);
    }
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

  const validateStep = (step: number): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    switch (step) {
      case 1:
        if (!formData.nome) {
          errors.nome = 'Nome é obrigatório';
          isValid = false;
        }
        if (!formData.cpf) {
          errors.cpf = 'CPF é obrigatório';
          isValid = false;
        } else if (!validateCPF(formData.cpf)) {
          errors.cpf = 'CPF inválido';
          isValid = false;
        }
        if (!formData.whatsapp) {
          errors.whatsapp = 'WhatsApp é obrigatório';
          isValid = false;
        }
        if (!formData.email) {
          errors.email = 'E-mail é obrigatório';
          isValid = false;
        }
        if (!formData.senha) {
          errors.senha = 'Senha é obrigatória';
          isValid = false;
        } else if (formData.senha.length < 8) {
          errors.senha = 'A senha deve ter pelo menos 8 caracteres';
          isValid = false;
        }
        if (!formData.confirmarSenha) {
          errors.confirmarSenha = 'Confirme a senha';
          isValid = false;
        } else if (formData.senha !== formData.confirmarSenha) {
          errors.confirmarSenha = 'As senhas não coincidem';
          isValid = false;
        }
        if (!formData.termoAjuizamento) {
          errors.termoAjuizamento = 'Aceite obrigatório';
          isValid = false;
        }
        if (!formData.termoConsentimento) {
          errors.termoConsentimento = 'Aceite obrigatório';
          isValid = false;
        }
        if (!formData.termoPoliticaPrivacidade) {
          errors.termoPoliticaPrivacidade = 'Aceite obrigatório';
          isValid = false;
        }
        break;
      case 2:
        if (!formData.cep) {
          errors.cep = 'CEP é obrigatório';
          isValid = false;
        }
        if (!formData.rua) {
          errors.rua = 'Rua é obrigatória';
          isValid = false;
        }
        if (!formData.numero) {
          errors.numero = 'Número é obrigatório';
          isValid = false;
        }
        if (!formData.cidade) {
          errors.cidade = 'Cidade é obrigatória';
          isValid = false;
        }
        if (!formData.estado) {
          errors.estado = 'Estado é obrigatório';
          isValid = false;
        }
        break;
      case 3:
        if (!formData.documentoIdentidadeUrl) {
          errors.documentoIdentidadeUrl = 'Anexe um documento com foto';
          isValid = false;
        }
        break;
      case 4:
        if (formData.patologiasSelecionadas.length === 0) {
          errors.patologiasSelecionadas = 'Selecione pelo menos uma condição de saúde';
          isValid = false;
        }
        if (formData.patologiasSelecionadas.includes('Outra (especificar)') && !formData.patologiaPersonalizada) {
          errors.patologiaPersonalizada = 'Informe a patologia com CID';
          isValid = false;
        }
        break;
    }

    setFieldErrors(errors);
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      setMessage(firstError || 'Preencha os campos destacados em vermelho');
    } else {
      setMessage('');
    }
    return isValid;
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
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/register-associado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha,
          role: 'PACIENTE',
          nome: formData.nome,
          cpf: formData.cpf.replace(/\D/g, ''),
          whatsapp: formData.whatsapp.replace(/\D/g, ''),
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
          documentosMedicosUrls: formData.documentosMedicosUrls,
          termoAjuizamento: formData.termoAjuizamento,
          consenteLGPD: formData.termoConsentimento,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar');
      }

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_STEP_KEY);
        setStatus('success');
        setMessage('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => router.push('/cadastro/sucesso'), 1500);
      } else if (response.ok) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_STEP_KEY);
        setStatus('success');
        setMessage('Cadastro realizado com sucesso! Redirecionando...');
        setTimeout(() => router.push('/cadastro/sucesso'), 1500);
      } else {
        setStatus('error');
        setMessage(data.message || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Erro ao cadastrar');
    }
  };

  const inputClass = "w-full rounded-lg border border-cinza-claro px-3 py-2.5 text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-verde-oliva";
  const inputErrorClass = "w-full rounded-lg border-2 border-red-500 px-3 py-2.5 text-cinza-escuro focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50";
  const labelClass = "text-sm font-medium text-cinza-escuro";
  const labelErrorClass = "text-sm font-medium text-red-600";
  
  const getInputClass = (field: keyof FormData) => fieldErrors[field] ? inputErrorClass : inputClass;
  const getLabelClass = (field: keyof FormData) => fieldErrors[field] ? labelErrorClass : labelClass;

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-verde-oliva font-medium mb-1">ABRACANM</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-cinza-escuro">
              Cadastro de Associado
            </h1>
            <p className="text-sm text-cinza-medio mt-1">
              Seu primeiro passo para uma vida com mais saúde e qualidade
            </p>
          </div>
          <Link href="/" className="text-sm text-verde-oliva hover:underline">
            Voltar
          </Link>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isCompleted ? 'bg-green-100 text-green-700' :
                  isCurrent ? 'bg-verde-oliva text-white' :
                  'bg-cinza-muito-claro text-cinza-medio'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 transition-all ${
                    isCompleted ? 'bg-green-300' : 'bg-cinza-claro'
                  }`} />
                )}
              </div>
            );
          })}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm font-medium text-verde-oliva">
            <Clock3 className="w-4 h-4" />
            <span>{currentStep} / {totalSteps}</span>
          </div>
        </div>

        <div className="h-2 w-full rounded-full bg-cinza-claro/60 overflow-hidden mb-8">
          <div
            className="h-full bg-verde-oliva transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="bg-white border border-cinza-claro rounded-2xl shadow-sm p-6 sm:p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              {hasRestoredData && (
                <div className="bg-[#3FA174]/10 border border-[#3FA174]/30 rounded-xl p-4 mb-2">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#3FA174]/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-[#3FA174]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#3FA174]">Dados recuperados</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Encontramos informações do seu cadastro anterior: <span className="font-medium">{restoredFields.join(', ')}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem(STORAGE_KEY);
                          localStorage.removeItem(STORAGE_STEP_KEY);
                          setFormData(initialFormData);
                          setCurrentStep(1);
                          setHasRestoredData(false);
                          setRestoredFields([]);
                        }}
                        className="text-xs text-gray-500 hover:text-red-500 underline mt-2 transition-colors"
                      >
                        Limpar e começar do zero
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Dados Pessoais e Termos</h2>
              
              <div className="space-y-4">
                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('nome')}>Nome completo *</span>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateField('nome', formatNome(e.target.value))}
                    className={getInputClass('nome')}
                    placeholder="Seu nome completo"
                  />
                  {fieldErrors.nome && <span className="text-xs text-red-500">{fieldErrors.nome}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('cpf')}>CPF *</span>
                  <input
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                    className={getInputClass('cpf')}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                  {fieldErrors.cpf && <span className="text-xs text-red-500">{fieldErrors.cpf}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('whatsapp')}>WhatsApp *</span>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => updateField('whatsapp', formatWhatsApp(e.target.value))}
                    className={getInputClass('whatsapp')}
                    placeholder="(00) 00000-0000"
                    maxLength={16}
                  />
                  {fieldErrors.whatsapp && <span className="text-xs text-red-500">{fieldErrors.whatsapp}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('email')}>E-mail *</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={getInputClass('email')}
                    placeholder="seu@email.com"
                  />
                  {fieldErrors.email && <span className="text-xs text-red-500">{fieldErrors.email}</span>}
                </label>

                <div className="flex flex-col gap-1.5">
                  <span className={getLabelClass('senha')}>Senha *</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.senha}
                      onChange={(e) => updateField('senha', e.target.value)}
                      className={`${getInputClass('senha')} pr-10`}
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza-medio hover:text-cinza-escuro transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.senha && <span className="text-xs text-red-500">{fieldErrors.senha}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className={getLabelClass('confirmarSenha')}>Confirmar Senha *</span>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmarSenha}
                      onChange={(e) => updateField('confirmarSenha', e.target.value)}
                      onPaste={preventPaste}
                      onCopy={(e) => e.preventDefault()}
                      onCut={(e) => e.preventDefault()}
                      className={`${getInputClass('confirmarSenha')} pr-10`}
                      placeholder="Digite a senha novamente"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cinza-medio hover:text-cinza-escuro transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {fieldErrors.confirmarSenha && <span className="text-xs text-red-500">{fieldErrors.confirmarSenha}</span>}
                </div>

                <div className="border-t border-cinza-claro pt-4 mt-6">
                  <h3 className="text-lg font-medium text-cinza-escuro mb-4">Termos e Consentimentos</h3>
                  
                  <TooltipProvider delayDuration={200}>
                    <div className="space-y-4">
                      <div className={`p-3 rounded-lg ${fieldErrors.termoAjuizamento ? 'bg-red-50 border border-red-300' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.termoAjuizamento}
                            onChange={(e) => updateField('termoAjuizamento', e.target.checked)}
                            className={`w-5 h-5 mt-0.5 rounded focus:ring-verde-oliva cursor-pointer ${fieldErrors.termoAjuizamento ? 'border-red-500 text-red-500' : 'border-cinza-claro text-verde-oliva'}`}
                          />
                          <span className={`flex-1 text-sm ${fieldErrors.termoAjuizamento ? 'text-red-600' : 'text-cinza-escuro'}`}>
                            Li e aceito o <a href="/termos-uso" target="_blank" className="text-verde-oliva underline">Termo de Uso</a> da ABRACANM.
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="flex-shrink-0 p-1 rounded-full hover:bg-verde-claro/20 transition-colors">
                                <Info className="w-5 h-5 text-verde-oliva" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs p-3 bg-white border border-cinza-claro shadow-lg">
                              <p className="text-sm text-cinza-escuro font-medium mb-2">Termo de Uso</p>
                              <ul className="text-xs text-cinza-medio space-y-1">
                                <li>• Define as regras de uso da plataforma ABRACANM</li>
                                <li>• Estabelece direitos e deveres como associado</li>
                                <li>• Inclui condições para importação de medicamentos via Anvisa</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${fieldErrors.termoConsentimento ? 'bg-red-50 border border-red-300' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.termoConsentimento}
                            onChange={(e) => updateField('termoConsentimento', e.target.checked)}
                            className={`w-5 h-5 mt-0.5 rounded focus:ring-verde-oliva cursor-pointer ${fieldErrors.termoConsentimento ? 'border-red-500 text-red-500' : 'border-cinza-claro text-verde-oliva'}`}
                          />
                          <span className={`flex-1 text-sm ${fieldErrors.termoConsentimento ? 'text-red-600' : 'text-cinza-escuro'}`}>
                            Consinto com o tratamento dos meus dados pessoais e de saúde conforme a 
                            <a href="/lgpd" target="_blank" className="text-verde-oliva underline ml-1">Lei Geral de Proteção de Dados (LGPD)</a>.
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="flex-shrink-0 p-1 rounded-full hover:bg-verde-claro/20 transition-colors">
                                <Info className="w-5 h-5 text-verde-oliva" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs p-3 bg-white border border-cinza-claro shadow-lg">
                              <p className="text-sm text-cinza-escuro font-medium mb-2">Consentimento LGPD</p>
                              <ul className="text-xs text-cinza-medio space-y-1">
                                <li>• Autoriza a coleta e armazenamento de seus dados pessoais</li>
                                <li>• Inclui dados sensíveis de saúde (diagnósticos, receitas, laudos)</li>
                                <li>• Permite compartilhamento com médicos prescritores credenciados</li>
                                <li>• Dados usados exclusivamente para fins de tratamento médico</li>
                                <li>• Você pode solicitar exclusão a qualquer momento</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg ${fieldErrors.termoPoliticaPrivacidade ? 'bg-red-50 border border-red-300' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={formData.termoPoliticaPrivacidade}
                            onChange={(e) => updateField('termoPoliticaPrivacidade', e.target.checked)}
                            className={`w-5 h-5 mt-0.5 rounded focus:ring-verde-oliva cursor-pointer ${fieldErrors.termoPoliticaPrivacidade ? 'border-red-500 text-red-500' : 'border-cinza-claro text-verde-oliva'}`}
                          />
                          <span className={`flex-1 text-sm ${fieldErrors.termoPoliticaPrivacidade ? 'text-red-600' : 'text-cinza-escuro'}`}>
                            Li e aceito a <a href="/politica-privacidade" target="_blank" className="text-verde-oliva underline">Política de Privacidade</a> da ABRACANM.
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="flex-shrink-0 p-1 rounded-full hover:bg-verde-claro/20 transition-colors">
                                <Info className="w-5 h-5 text-verde-oliva" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs p-3 bg-white border border-cinza-claro shadow-lg">
                              <p className="text-sm text-cinza-escuro font-medium mb-2">Política de Privacidade</p>
                              <ul className="text-xs text-cinza-medio space-y-1">
                                <li>• Explica como seus dados são protegidos e armazenados</li>
                                <li>• Detalha medidas de segurança (criptografia, backups)</li>
                                <li>• Informa sobre cookies e tecnologias de rastreamento</li>
                                <li>• Descreve seus direitos sobre seus dados pessoais</li>
                                <li>• Inclui informações de contato do encarregado de dados</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Endereço</h2>
              
              <div className="space-y-4">
                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('cep')}>CEP *</span>
                  <div className="flex gap-2">
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
                      className={getInputClass('cep')}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {cepLoading && <span className="text-sm text-cinza-medio self-center">Buscando...</span>}
                  </div>
                  {fieldErrors.cep && <span className="text-xs text-red-500">{fieldErrors.cep}</span>}
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className={getLabelClass('rua')}>Rua *</span>
                  <input
                    type="text"
                    value={formData.rua}
                    onChange={(e) => updateField('rua', e.target.value)}
                    className={getInputClass('rua')}
                    placeholder="Nome da rua"
                  />
                  {fieldErrors.rua && <span className="text-xs text-red-500">{fieldErrors.rua}</span>}
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={getLabelClass('numero')}>Número *</span>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => updateField('numero', e.target.value)}
                      className={getInputClass('numero')}
                      placeholder="123"
                    />
                    {fieldErrors.numero && <span className="text-xs text-red-500">{fieldErrors.numero}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Complemento</span>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => updateField('complemento', e.target.value)}
                      className={inputClass}
                      placeholder="Apto, sala..."
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
                    placeholder="Bairro"
                  />
                </label>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className={getLabelClass('cidade')}>Cidade *</span>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => updateField('cidade', e.target.value)}
                      className={getInputClass('cidade')}
                      placeholder="Cidade"
                    />
                    {fieldErrors.cidade && <span className="text-xs text-red-500">{fieldErrors.cidade}</span>}
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className={getLabelClass('estado')}>Estado *</span>
                    <input
                      type="text"
                      value={formData.estado}
                      onChange={(e) => updateField('estado', e.target.value.toUpperCase())}
                      className={getInputClass('estado')}
                      placeholder="UF"
                      maxLength={2}
                    />
                    {fieldErrors.estado && <span className="text-xs text-red-500">{fieldErrors.estado}</span>}
                  </label>
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Documento com Foto</h2>
              
              <p className="text-sm text-cinza-medio mb-4">
                Anexe um documento de identificação com foto (RG, CNH, Passaporte).
              </p>

              <div className="border-2 border-dashed border-cinza-claro rounded-lg p-6 text-center">
                {formData.documentoIdentidadeUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 text-sucesso">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">Documento enviado com sucesso!</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateField('documentoIdentidadeUrl', '')}
                      className="text-sm text-erro hover:underline"
                    >
                      Remover e enviar outro
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="space-y-2">
                      <svg className="w-12 h-12 mx-auto text-cinza-medio" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-cinza-medio">
                        {uploadingDoc ? 'Enviando...' : 'Clique para selecionar ou tirar foto'}
                      </p>
                      <p className="text-xs text-cinza-medio">
                        Formatos aceitos: JPG, PNG, HEIC (iPhone), WebP, GIF, BMP, TIFF ou PDF
                      </p>
                      <p className="text-xs text-cinza-medio">Máximo 10MB</p>
                    </div>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,.webp,.gif,.bmp,.tiff,.tif,image/*"
                      capture="environment"
                      onChange={handleDocumentoUpload}
                      className="hidden"
                      disabled={uploadingDoc}
                    />
                  </label>
                )}
              </div>
              
              <div className="bg-azul-claro/10 border border-azul-claro/30 rounded-lg p-4">
                <p className="text-xs text-cinza-medio">
                  <strong className="text-cinza-escuro">Dica:</strong> Se estiver usando iPhone, suas fotos podem estar em formato HEIC - isso é suportado! 
                  Caso tenha problemas, abra a foto no app Fotos, toque em &quot;Compartilhar&quot; e escolha &quot;Salvar como JPEG&quot;.
                </p>
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-cinza-escuro mb-4">Informações Médicas</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className={labelClass}>Já é paciente de cannabis medicinal com receita médica?</span>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jaUsaCannabis"
                        checked={formData.jaUsaCannabis}
                        onChange={() => updateField('jaUsaCannabis', true)}
                        className="w-4 h-4 text-verde-oliva"
                      />
                      <span>Sim</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jaUsaCannabis"
                        checked={!formData.jaUsaCannabis}
                        onChange={() => updateField('jaUsaCannabis', false)}
                        className="w-4 h-4 text-verde-oliva"
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className={labelClass}>Quais suas condições de saúde? * <span className="text-xs text-gray-500 font-normal">(selecione todas que se aplicam)</span></span>
                  {fieldErrors.patologiasSelecionadas && <span className="text-xs text-red-500">{fieldErrors.patologiasSelecionadas}</span>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-white">
                    {PATOLOGIAS_COMUNS.map((patologia) => (
                      <label
                        key={patologia.label}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                          formData.patologiasSelecionadas.includes(patologia.label)
                            ? 'bg-[#3FA174]/10 border border-[#3FA174]'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.patologiasSelecionadas.includes(patologia.label)}
                          onChange={() => togglePatologia(patologia.label)}
                          className="w-4 h-4 text-[#3FA174] border-gray-300 rounded focus:ring-[#3FA174]"
                        />
                        <span className="text-sm text-gray-700">
                          {patologia.cid ? `${patologia.label} (${patologia.cid})` : patologia.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.patologiasSelecionadas.length > 0 && (
                    <p className="text-xs text-[#3FA174]">{formData.patologiasSelecionadas.length} condição(ões) selecionada(s)</p>
                  )}
                </div>

                {formData.patologiasSelecionadas.includes('Outra (especificar)') && (
                  <label className="flex flex-col gap-1.5">
                    <span className={labelClass}>Informe sua condição com CID *</span>
                    <input
                      type="text"
                      value={formData.patologiaPersonalizada}
                      onChange={(e) => updateField('patologiaPersonalizada', e.target.value)}
                      className={inputClass}
                      placeholder="Ex: Neuropatia (G62.9)"
                    />
                  </label>
                )}

                <div className="space-y-2">
                  <span className={labelClass}>Anexar documentos médicos (opcional)</span>
                  <p className="text-xs text-cinza-medio">Receita médica, laudo, autorização da Anvisa. Até 5 arquivos, máximo 10MB cada.</p>
                  
                  <div className="border-2 border-dashed border-cinza-claro rounded-lg p-6 text-center">
                    {formData.documentosMedicosUrls.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-sucesso">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-medium">{formData.documentosMedicosUrls.length} documento(s) enviado(s)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateField('documentosMedicosUrls', [])}
                          className="text-sm text-erro hover:underline"
                        >
                          Remover e enviar outros
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <div className="space-y-2">
                          <svg className="w-12 h-12 mx-auto text-cinza-medio" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <p className="text-cinza-medio">
                            {uploadingMedicos ? 'Enviando...' : 'Clique para selecionar ou tirar foto'}
                          </p>
                          <p className="text-xs text-cinza-medio">
                            Formatos: JPG, PNG, HEIC (iPhone), WebP, GIF, BMP, TIFF ou PDF
                          </p>
                        </div>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf,.heic,.heif,.webp,.gif,.bmp,.tiff,.tif,image/*"
                          multiple
                          onChange={handleDocumentosMedicosUpload}
                          className="hidden"
                          disabled={uploadingMedicos}
                        />
                      </label>
                    )}
                  </div>
                </div>
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
              <Button 
                onClick={handleSubmit}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Cadastrando...' : 'Finalizar Cadastro'}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-cinza-medio mt-6">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-verde-oliva hover:underline">
            Faça login
          </Link>
        </p>
      </div>
    </main>
  );
}
