'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Clock, Home } from 'lucide-react';

const tipoInfo: Record<string, { titulo: string; subtitulo: string; proximosPassos: string[]; redirectTo: string; redirectLabel: string; needsReview: boolean }> = {
  associado: {
    titulo: 'Cadastro Realizado com Sucesso!',
    subtitulo: 'Bem-vindo(a) à ABRACANM! Você agora faz parte da nossa comunidade.',
    proximosPassos: [
      'Complete sua pré-anamnese no dashboard',
      'Aguarde contato do nosso time de acolhimento',
      'Agende sua consulta com um prescritor',
    ],
    redirectTo: '/dashboard',
    redirectLabel: 'Ir para o Dashboard',
    needsReview: false,
  },
  medico: {
    titulo: 'Cadastro de Médico Enviado!',
    subtitulo: 'Seu cadastro foi recebido e está em análise. Validaremos seu CRM em breve.',
    proximosPassos: [
      'Aguarde a validação do seu CRM',
      'Você receberá um e-mail de confirmação',
      'Após aprovação, poderá acessar a área do prescritor',
    ],
    redirectTo: '/',
    redirectLabel: 'Voltar para o Início',
    needsReview: true,
  },
  instituto: {
    titulo: 'Cadastro de Instituto Enviado!',
    subtitulo: 'Seu cadastro foi recebido e nossa equipe entrará em contato em até 48 horas.',
    proximosPassos: [
      'Aguarde análise do cadastro',
      'Nossa equipe entrará em contato via e-mail ou WhatsApp',
      'Após aprovação, você receberá acesso à área de parceiros',
    ],
    redirectTo: '/',
    redirectLabel: 'Voltar para o Início',
    needsReview: true,
  },
  parceiro: {
    titulo: 'Cadastro de Parceiro Enviado!',
    subtitulo: 'Seu cadastro foi recebido e nossa equipe entrará em contato em até 48 horas.',
    proximosPassos: [
      'Aguarde análise do cadastro',
      'Nossa equipe entrará em contato via e-mail ou WhatsApp',
      'Após aprovação, você receberá acesso à área de parceiros',
    ],
    redirectTo: '/',
    redirectLabel: 'Voltar para o Início',
    needsReview: true,
  },
};

function CadastroSucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo') || 'associado';
  const info = tipoInfo[tipo] || tipoInfo.associado;
  
  const [countdown, setCountdown] = useState(info.needsReview ? 10 : 5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(info.redirectTo);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, info.redirectTo]);

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
      <Card className="max-w-lg w-full text-center border-cinza-claro">
        <CardContent className="pt-8 pb-8">
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              info.needsReview ? 'bg-alerta/10' : 'bg-sucesso/10'
            }`}>
              {info.needsReview ? (
                <Clock className="w-12 h-12 text-alerta" />
              ) : (
                <CheckCircle className="w-12 h-12 text-sucesso" />
              )}
            </div>
          </div>

          <p className="text-sm text-verde-oliva font-medium mb-2 tracking-wide uppercase">ABRACANM</p>
          
          <h1 className="text-2xl sm:text-3xl font-semibold text-cinza-escuro mb-4">
            {info.titulo}
          </h1>
          
          <p className="text-cinza-medio mb-6 leading-relaxed">
            {info.subtitulo}
          </p>

          <div className={`rounded-xl p-4 mb-6 ${
            info.needsReview 
              ? 'bg-alerta/10 border border-alerta/30' 
              : 'bg-verde-claro/10 border border-verde-claro/30'
          }`}>
            <p className={`text-sm font-medium ${info.needsReview ? 'text-alerta' : 'text-verde-oliva'}`}>
              Próximos passos:
            </p>
            <ul className="text-sm text-cinza-escuro mt-2 space-y-1 text-left">
              {info.proximosPassos.map((passo, i) => (
                <li key={i}>• {passo}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-cinza-medio mb-4">
            Redirecionando em <span className="font-semibold text-verde-oliva">{countdown}</span> segundos...
          </p>

          <Button
            onClick={() => router.push(info.redirectTo)}
            className="w-full sm:w-auto"
          >
            {info.redirectTo === '/' ? <Home className="mr-2 w-4 h-4" /> : null}
            {info.redirectLabel}
            {info.redirectTo !== '/' ? <ArrowRight className="ml-2 w-4 h-4" /> : null}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function CadastroSucessoPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#fafaf8] flex items-center justify-center">
        <div className="text-cinza-medio">Carregando...</div>
      </main>
    }>
      <CadastroSucessoContent />
    </Suspense>
  );
}
