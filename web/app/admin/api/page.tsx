'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Code, 
  Server, 
  Shield, 
  Copy, 
  Check,
  ChevronDown,
  ChevronRight,
  Zap,
  Users,
  Calendar,
  CreditCard,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DatabaseWithRestApi from '@/components/ui/database-with-rest-api';

const endpoints = [
  {
    category: 'Associados',
    icon: Users,
    routes: [
      { method: 'GET', path: '/api/associados', description: 'Listar todos os associados' },
      { method: 'GET', path: '/api/associados/:id', description: 'Buscar associado por ID' },
      { method: 'POST', path: '/api/associados', description: 'Criar novo associado' },
      { method: 'PUT', path: '/api/associados/:id', description: 'Atualizar associado' },
      { method: 'DELETE', path: '/api/associados/:id', description: 'Remover associado' },
    ]
  },
  {
    category: 'Agendamentos',
    icon: Calendar,
    routes: [
      { method: 'GET', path: '/api/agendamentos', description: 'Listar agendamentos' },
      { method: 'POST', path: '/api/agendamentos', description: 'Criar agendamento' },
      { method: 'PUT', path: '/api/agendamentos/:id', description: 'Atualizar agendamento' },
      { method: 'DELETE', path: '/api/agendamentos/:id', description: 'Cancelar agendamento' },
    ]
  },
  {
    category: 'Pagamentos',
    icon: CreditCard,
    routes: [
      { method: 'GET', path: '/api/pagamentos', description: 'Listar pagamentos' },
      { method: 'POST', path: '/api/pagamentos/pix', description: 'Gerar cobrança Pix' },
      { method: 'POST', path: '/api/pagamentos/webhook', description: 'Webhook de confirmação' },
    ]
  },
  {
    category: 'Planos',
    icon: FileText,
    routes: [
      { method: 'GET', path: '/api/planos', description: 'Listar planos disponíveis' },
      { method: 'POST', path: '/api/planos', description: 'Criar novo plano' },
      { method: 'PUT', path: '/api/planos/:id', description: 'Atualizar plano' },
    ]
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-[#6B7C59] text-white',
  POST: 'bg-blue-500 text-white',
  PUT: 'bg-amber-500 text-white',
  DELETE: 'bg-red-500 text-white',
};

export default function ApiDocumentationPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Associados']);

  const copyToClipboard = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#6B7C59]/10 rounded-xl">
              <Database className="h-6 w-6 text-[#6B7C59]" />
            </div>
            <h1 className="text-3xl font-semibold text-[#1d1d1f]">API Documentation</h1>
          </div>
          <p className="text-[#86868b] mb-8">
            Documentação técnica dos endpoints REST da plataforma ABRACANM.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white border-[#e5e5e5] h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f]">
                  <Server className="h-5 w-5 text-[#6B7C59]" />
                  Arquitetura REST
                </CardTitle>
                <CardDescription>
                  Visualização da comunicação entre frontend e backend
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DatabaseWithRestApi 
                  title="API ABRACANM v2"
                  circleText="REST"
                  badgeTexts={{
                    first: "GET",
                    second: "POST",
                    third: "PUT",
                    fourth: "DELETE"
                  }}
                  buttonTexts={{
                    first: "Frontend",
                    second: "Backend"
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="bg-white border-[#e5e5e5]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f] text-lg">
                  <Shield className="h-5 w-5 text-[#6B7C59]" />
                  Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#86868b] mb-3">
                  Todas as rotas protegidas requerem JWT no header:
                </p>
                <div className="bg-[#1d1d1f] rounded-lg p-3 font-mono text-sm text-green-400">
                  Authorization: Bearer {'<token>'}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#e5e5e5]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f] text-lg">
                  <Code className="h-5 w-5 text-[#6B7C59]" />
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#1d1d1f] rounded-lg p-3 font-mono text-sm text-blue-400 flex items-center justify-between">
                  <span>https://api.abracanm.org.br/v2</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                    onClick={() => copyToClipboard('https://api.abracanm.org.br/v2')}
                  >
                    {copiedPath === 'https://api.abracanm.org.br/v2' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#e5e5e5]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#1d1d1f] text-lg">
                  <Zap className="h-5 w-5 text-[#6B7C59]" />
                  Rate Limiting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#86868b]">
                  100 requisições por minuto por IP. Headers de resposta:
                </p>
                <div className="mt-2 space-y-1 text-xs font-mono text-[#1d1d1f]">
                  <div>X-RateLimit-Limit: 100</div>
                  <div>X-RateLimit-Remaining: 99</div>
                  <div>X-RateLimit-Reset: 1609459200</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Endpoints</h2>
          
          <div className="space-y-4">
            {endpoints.map((category) => {
              const Icon = category.icon;
              const isExpanded = expandedCategories.includes(category.category);
              
              return (
                <Card key={category.category} className="bg-white border-[#e5e5e5] overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.category)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#fafaf8] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#6B7C59]/10 rounded-lg">
                        <Icon className="h-5 w-5 text-[#6B7C59]" />
                      </div>
                      <span className="font-semibold text-[#1d1d1f]">{category.category}</span>
                      <Badge variant="secondary" className="bg-[#6B7C59]/10 text-[#6B7C59]">
                        {category.routes.length} routes
                      </Badge>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-[#86868b]" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-[#86868b]" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-[#e5e5e5]">
                      {category.routes.map((route, idx) => (
                        <div 
                          key={idx}
                          className="px-6 py-3 flex items-center justify-between hover:bg-[#fafaf8] transition-colors border-b border-[#e5e5e5] last:border-b-0"
                        >
                          <div className="flex items-center gap-4">
                            <Badge className={methodColors[route.method]}>
                              {route.method}
                            </Badge>
                            <code className="text-sm text-[#1d1d1f] font-mono">
                              {route.path}
                            </code>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-[#86868b] hidden sm:inline">
                              {route.description}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#86868b] hover:text-[#1d1d1f]"
                              onClick={() => copyToClipboard(route.path)}
                            >
                              {copiedPath === route.path ? (
                                <Check className="h-4 w-4 text-[#6B7C59]" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
