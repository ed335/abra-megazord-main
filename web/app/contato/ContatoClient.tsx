'use client';

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User,
  HelpCircle,
  Calendar,
  CreditCard,
  FileText,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FooterSection } from '@/components/ui/footer-section';
import CannabisLeaf from '@/components/icons/CannabisLeaf';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  options?: QuickOption[];
  timestamp: Date;
}

interface QuickOption {
  id: string;
  label: string;
  icon: React.ElementType;
  response: string;
  followUp?: QuickOption[];
}

const faqData: QuickOption[] = [
  {
    id: 'cadastro',
    label: 'Como me cadastrar?',
    icon: User,
    response: 'O cadastro é simples e rápido! Você pode se cadastrar como Paciente (Associado), Médico Prescritor, Instituto Médico ou Associação Parceira. Basta acessar nossa página de cadastro e escolher seu perfil. O processo leva apenas alguns minutos.',
    followUp: [
      { id: 'cadastro-paciente', label: 'Cadastro de Paciente', icon: User, response: 'Para se cadastrar como paciente, você precisará informar seus dados pessoais, endereço e fazer upload de um documento de identidade. Após o cadastro, nossa equipe entrará em contato para dar continuidade ao seu tratamento.' },
      { id: 'cadastro-medico', label: 'Cadastro de Médico', icon: Stethoscope, response: 'Médicos podem se cadastrar informando CRM, especialidade e documentação profissional. Após validação do CRM, você terá acesso à área do prescritor para atender pacientes via teleconsulta.' },
    ]
  },
  {
    id: 'consulta',
    label: 'Como agendar consulta?',
    icon: Calendar,
    response: 'Após completar seu cadastro e a pré-anamnese, você poderá agendar uma teleconsulta com um de nossos prescritores. Basta acessar a área "Agendar" no seu dashboard e escolher um horário disponível.',
  },
  {
    id: 'pagamento',
    label: 'Formas de pagamento',
    icon: CreditCard,
    response: 'Aceitamos pagamento via PIX com processamento imediato. Oferecemos diferentes planos de assinatura: Essencial, Premium e Família. Cada plano inclui benefícios específicos como consultas, acompanhamento e descontos em produtos.',
  },
  {
    id: 'prescricao',
    label: 'Sobre prescrições',
    icon: FileText,
    response: 'As prescrições são emitidas digitalmente após a teleconsulta com o médico. O documento é válido em todo o território nacional e permite a aquisição de produtos à base de cannabis medicinal em farmácias autorizadas ou importação pela ANVISA.',
  },
  {
    id: 'outros',
    label: 'Outras dúvidas',
    icon: HelpCircle,
    response: 'Se sua dúvida não foi respondida, você pode nos enviar uma mensagem detalhada abaixo ou entrar em contato diretamente via WhatsApp. Nossa equipe responde em até 24 horas úteis.',
  },
];

const contactInfo = [
  {
    icon: Phone,
    label: 'WhatsApp',
    value: '+55 61 98147-1038',
    action: () => window.open('https://wa.me/5561981471038?text=Olá! Vim pelo site da ABRACANM e gostaria de mais informações.', '_blank'),
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contato@abracanm.org.br',
    action: () => window.location.href = 'mailto:contato@abracanm.org.br',
  },
  {
    icon: MapPin,
    label: 'Endereço',
    value: 'Brasília, DF - Brasil',
    action: null,
  },
  {
    icon: Clock,
    label: 'Atendimento',
    value: 'Seg a Sex, 9h às 18h',
    action: null,
  },
];

export default function ContatoClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: 'Olá! Sou o assistente virtual da ABRACANM. Como posso ajudar você hoje?',
      options: faqData,
      timestamp: new Date(),
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (content: string, options?: QuickOption[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content,
        options,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 800);
  };

  const handleOptionClick = (option: QuickOption) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: option.label,
      timestamp: new Date(),
    }]);

    setTimeout(() => {
      addBotMessage(option.response, option.followUp);
    }, 300);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    }]);

    setShowContactForm(true);
    addBotMessage(
      'Obrigado pela sua mensagem! Para que nossa equipe possa responder, por favor informe seu nome e email abaixo, ou entre em contato diretamente pelo WhatsApp.'
    );
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nome = formData.get('nome');
    const email = formData.get('email');

    if (nome && email) {
      setShowContactForm(false);
      addBotMessage(
        `Perfeito, ${nome}! Recebemos sua mensagem e responderemos em breve no email ${email}. Você também pode nos chamar no WhatsApp para atendimento mais rápido.`
      );
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5561981471038?text=Olá! Vim pelo site da ABRACANM e gostaria de mais informações.', '_blank');
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Fale Conosco
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Estamos aqui para ajudar. Use nosso assistente virtual para respostas rápidas ou entre em contato diretamente.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
                <div className="bg-gradient-to-r from-[#3FA174] to-[#2D8B5F] px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <CannabisLeaf className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-white">Assistente ABRACANM</h2>
                    <p className="text-xs text-white/80 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                      Online agora
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-gray-50/50">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === 'bot' 
                              ? 'bg-gradient-to-br from-[#3FA174] to-[#2D8B5F]' 
                              : 'bg-gray-200'
                          }`}>
                            {message.type === 'bot' ? (
                              <Bot className="w-4 h-4 text-white" />
                            ) : (
                              <User className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className={`rounded-2xl px-4 py-3 ${
                              message.type === 'bot'
                                ? 'bg-white border border-gray-100 shadow-sm rounded-tl-md'
                                : 'bg-[#3FA174] text-white rounded-tr-md'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            
                            {message.options && message.options.length > 0 && (
                              <motion.div 
                                className="mt-3 flex flex-wrap gap-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                {message.options.map((option) => (
                                  <motion.button
                                    key={option.id}
                                    onClick={() => handleOptionClick(option)}
                                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-[#3FA174] hover:text-[#3FA174] transition-all shadow-sm"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                  >
                                    <option.icon className="w-4 h-4" />
                                    {option.label}
                                  </motion.button>
                                ))}
                              </motion.div>
                            )}
                            
                            <p className={`text-[10px] mt-1 ${message.type === 'bot' ? 'text-gray-400' : 'text-gray-400 text-right'}`}>
                              {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3FA174] to-[#2D8B5F] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {showContactForm && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                      >
                        <form onSubmit={handleContactSubmit} className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Mail className="w-4 h-4 text-[#3FA174]" />
                            <p className="text-sm font-medium text-gray-700">Seus dados para contato</p>
                          </div>
                          <input
                            type="text"
                            name="nome"
                            required
                            placeholder="Seu nome"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA174]/20 focus:border-[#3FA174]"
                          />
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="Seu email"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA174]/20 focus:border-[#3FA174]"
                          />
                          <div className="flex gap-2">
                            <Button type="submit" size="sm" className="flex-1 bg-[#3FA174] hover:bg-[#359966]">
                              Enviar
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={openWhatsApp}
                              className="gap-2"
                            >
                              <Phone className="w-4 h-4" />
                              WhatsApp
                            </Button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>

                <div className="bg-white border-t border-gray-100 p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#3FA174]/20 focus:border-[#3FA174] transition-all"
                    />
                    <motion.button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-12 h-12 rounded-full bg-[#3FA174] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#359966] transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#3FA174]" />
                  Canais de Atendimento
                </h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div 
                      key={index}
                      onClick={info.action || undefined}
                      className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${
                        info.action 
                          ? 'cursor-pointer hover:bg-gray-50' 
                          : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-[#3FA174]/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="w-5 h-5 text-[#3FA174]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">{info.label}</p>
                        <p className={`text-sm font-medium ${info.action ? 'text-[#3FA174]' : 'text-gray-900'}`}>
                          {info.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#3FA174] to-[#2D8B5F] rounded-2xl p-6 text-white">
                <h3 className="font-semibold mb-2">Atendimento via WhatsApp</h3>
                <p className="text-sm text-white/80 mb-4">
                  Para um atendimento mais rápido e personalizado, fale diretamente com nossa equipe pelo WhatsApp.
                </p>
                <Button 
                  onClick={openWhatsApp}
                  className="w-full bg-white text-[#3FA174] hover:bg-gray-100 gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Iniciar conversa
                </Button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-3">Dúvidas Frequentes</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FA174]" />
                    Cannabis medicinal é 100% legal no Brasil
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FA174]" />
                    Consultas por vídeo com médicos especializados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FA174]" />
                    Prescrição digital válida em todo o país
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FA174]" />
                    Suporte contínuo para pacientes
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
