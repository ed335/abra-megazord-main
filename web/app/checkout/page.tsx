'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getToken, fetchWithAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, Copy, Check, Loader2, Clock, CheckCircle2, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface CheckoutData {
  id: string;
  valor: number;
  pixCode: string;
  identifier: string;
  expiracao: string;
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'expired'>('pending');

  const tipo = searchParams.get('tipo') || 'MENSALIDADE';
  const planoId = searchParams.get('plano');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login?redirect=/checkout');
      return;
    }
    
    const loadUserAndGeneratePayment = async () => {
      try {
        const userData = await fetchWithAuth<{ cpf?: string }>('/api/auth/me');
        
        if (!userData.cpf) {
          setError('CPF não cadastrado. Por favor, atualize seu cadastro.');
          setLoading(false);
          return;
        }
        
        const data = await fetchWithAuth<{ success: boolean; pagamento: CheckoutData; error?: string }>(
          '/api/pagamentos/checkout',
          {
            method: 'POST',
            body: JSON.stringify({
              tipo,
              planoId: planoId || undefined,
              cpf: userData.cpf,
            }),
          }
        );

        if (data.success && data.pagamento) {
          setCheckout(data.pagamento);
        } else {
          setError(data.error || 'Erro ao gerar pagamento');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserAndGeneratePayment();
  }, [router, tipo, planoId]);

  useEffect(() => {
    if (!checkout) return;

    const interval = setInterval(async () => {
      try {
        const data = await fetchWithAuth<{ pagamento: { status: string } }>(
          `/api/pagamentos/status?pagamentoId=${checkout.id}`
        );
        
        if (data.pagamento?.status === 'PAGO') {
          setPaymentStatus('paid');
          toast.success('Pagamento confirmado!');
          clearInterval(interval);
        } else if (data.pagamento?.status === 'EXPIRADO' || data.pagamento?.status === 'FALHOU') {
          setPaymentStatus('expired');
          toast.error('Pagamento expirou ou falhou');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Erro ao verificar status:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkout]);

  const copyPixCode = () => {
    if (checkout?.pixCode) {
      navigator.clipboard.writeText(checkout.pixCode);
      setCopied(true);
      toast.success('Código Pix copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTipoLabel = () => {
    switch (tipo) {
      case 'MENSALIDADE': return 'Mensalidade';
      case 'CONSULTA': return 'Consulta Médica';
      case 'PRIMEIRA_CONSULTA': return 'Primeira Consulta';
      default: return 'Pagamento';
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        
        <div className="max-w-md mx-auto px-4 py-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="text-center mb-8 space-y-2">
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-5 w-32 mx-auto" />
          </div>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-5 w-40 mx-auto" />
              <Skeleton className="h-12 w-32 mx-auto" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (paymentStatus === 'paid') {
    const isMensalidade = tipo === 'MENSALIDADE';
    
    return (
      <main className="min-h-screen bg-background">
        
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <CheckCircle2 className="w-10 h-10 text-primary" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Pagamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              {isMensalidade 
                ? 'Parabéns! Você agora é associado ABRACANM.' 
                : 'Seu pagamento foi processado com sucesso.'}
            </p>
          </div>

          {isMensalidade ? (
            <Card className="mb-6 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Benefícios ativados:
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Primeira consulta por R$ 99 (economia de R$ 50)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Suporte contínuo via WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Acompanhamento do tratamento
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    Orientação jurídica sobre importação
                  </li>
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Consulta paga com sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Seu pagamento foi confirmado. Nossa equipe entrará em contato 
                  para confirmar o agendamento da sua consulta.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8 bg-muted/50">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold mb-4">
                Próximo passo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isMensalidade 
                  ? 'Agende sua primeira consulta com desconto exclusivo de associado!' 
                  : 'Entre em contato para agendar sua consulta.'}
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/agendar">
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Minha Consulta
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-primary transition underline"
            >
              Ou ir para o Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      
      
      <div className="max-w-md mx-auto px-4 py-8">
        <Link 
          href="/planos" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos planos
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Pague com Pix
          </h1>
          <p className="text-muted-foreground text-sm">{getTipoLabel()}</p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {checkout && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-4 h-4" />
                  Válido por 30 minutos
                </div>

                <div className="text-3xl font-bold text-primary mb-6">
                  {formatCurrency(checkout.valor)}
                </div>

                <div className="bg-muted p-4 rounded-lg mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Código Pix Copia e Cola:</p>
                  <div className="bg-background p-3 rounded border break-all text-xs font-mono">
                    {checkout.pixCode.slice(0, 80)}...
                  </div>
                </div>

                <Button
                  onClick={copyPixCode}
                  variant="outline"
                  className="w-full"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar Código Pix
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-sm text-primary font-medium mb-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Aguardando pagamento...
                </div>
                <p className="text-xs text-muted-foreground">
                  Após o pagamento, esta página será atualizada automaticamente.
                </p>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Problemas com o pagamento?{' '}
                <a href="mailto:ouvidoria@abracanm.org.br" className="text-primary underline">
                  Entre em contato
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </main>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
