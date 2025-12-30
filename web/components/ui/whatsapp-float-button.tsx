'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WhatsAppFloatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'message'>('form');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [errors, setErrors] = useState<{ nome?: string; whatsapp?: string; mensagem?: string }>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { nome?: string; whatsapp?: string } = {};
    
    if (!nome.trim()) {
      newErrors.nome = 'Informe seu nome';
    }
    
    const phoneDigits = whatsapp.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      newErrors.whatsapp = 'WhatsApp inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep('message');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mensagem.trim()) {
      setErrors({ mensagem: 'Escreva sua mensagem' });
      return;
    }

    const fullMessage = `Olá! Meu nome é ${nome.trim()} e meu WhatsApp é ${whatsapp}.\n\n${mensagem.trim()}`;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    window.open(`https://wa.me/5561981471038?text=${encodedMessage}`, '_blank');
    
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('form');
    setNome('');
    setWhatsapp('');
    setMensagem('');
    setErrors({});
  };

  const handleBack = () => {
    setStep('form');
    setMensagem('');
    setErrors({});
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Fale com Humano</p>
                      <p className="text-white/80 text-xs">
                        {step === 'form' ? 'Seus dados' : 'Sua mensagem'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {step === 'form' ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onSubmit={handleNextStep}
                    className="p-4 space-y-4"
                  >
                    <p className="text-sm text-gray-600">
                      Preencha seus dados para falar com nossa equipe:
                    </p>

                    <div>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => {
                          setNome(e.target.value);
                          if (errors.nome) setErrors(prev => ({ ...prev, nome: undefined }));
                        }}
                        placeholder="Seu nome"
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all ${
                          errors.nome ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      {errors.nome && (
                        <p className="text-xs text-red-500 mt-1">{errors.nome}</p>
                      )}
                    </div>

                    <div>
                      <input
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => {
                          setWhatsapp(formatPhone(e.target.value));
                          if (errors.whatsapp) setErrors(prev => ({ ...prev, whatsapp: undefined }));
                        }}
                        placeholder="(00) 00000-0000"
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all ${
                          errors.whatsapp ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      {errors.whatsapp && (
                        <p className="text-xs text-red-500 mt-1">{errors.whatsapp}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                    >
                      Continuar
                      <Send className="w-4 h-4" />
                    </Button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="message"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleSubmit}
                    className="p-4 space-y-4"
                  >
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-[#25D366]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{nome}</p>
                        <p className="text-xs text-gray-500">{whatsapp}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="text-xs text-[#25D366] hover:underline"
                      >
                        Editar
                      </button>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">
                        Escreva sua mensagem:
                      </label>
                      <textarea
                        value={mensagem}
                        onChange={(e) => {
                          setMensagem(e.target.value);
                          if (errors.mensagem) setErrors(prev => ({ ...prev, mensagem: undefined }));
                        }}
                        placeholder="Olá! Gostaria de saber mais sobre..."
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/30 focus:border-[#25D366] transition-all resize-none ${
                          errors.mensagem ? 'border-red-400' : 'border-gray-200'
                        }`}
                      />
                      {errors.mensagem && (
                        <p className="text-xs text-red-500 mt-1">{errors.mensagem}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Enviar via WhatsApp
                    </Button>

                    <p className="text-[10px] text-gray-400 text-center">
                      Você será redirecionado para o WhatsApp com sua mensagem.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg flex items-center justify-center hover:bg-[#128C7E] transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { rotate: 90 } : { rotate: 0 }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </motion.button>
    </>
  );
}
