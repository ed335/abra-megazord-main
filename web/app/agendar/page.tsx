'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar, Clock, Video, MapPin, ArrowLeft, Phone, CreditCard, Check, ArrowRight } from 'lucide-react';

interface Assinatura {
  id: string;
  status: string;
  plano: {
    nome: string;
  };
}

type ModalidadeConsulta = 'teleconsulta' | 'presencial' | null;

export default function AgendarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedModalidade, setSelectedModalidade] = useState<ModalidadeConsulta>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch('/api/assinatura', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.assinatura && data.assinatura.status === 'ATIVA') {
          setAssinatura(data.assinatura);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const handleAgendar = (modalidade: ModalidadeConsulta) => {
    setSelectedModalidade(modalidade);
    setDialogOpen(true);
  };

  const confirmarAgendamento = () => {
    const mensagem = selectedModalidade === 'teleconsulta'
      ? 'Olá! Sou associado ABRACANM e gostaria de agendar uma teleconsulta.'
      : 'Olá! Sou associado ABRACANM e gostaria de agendar uma consulta presencial.';
    
    window.open(`https://wa.me/5561981471038?text=${encodeURIComponent(mensagem)}`, '_blank');
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <Skeleton className="h-5 w-40 mb-6" />
          <Skeleton className="h-12 w-48 mb-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }

  if (!assinatura) {
    return (
      <main className="min-h-screen bg-background">
        
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              Para agendar, torne-se associado
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Associados ABRACANM têm acesso a consultas com desconto, 
              suporte contínuo e acompanhamento completo do tratamento.
            </p>
          </div>

          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Ao se tornar associado você ganha:</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong>Primeira consulta por R$ 99</strong> (economia de R$ 50)</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Suporte contínuo via WhatsApp</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Acompanhamento do tratamento</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Orientação jurídica sobre importação</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button asChild size="lg" className="w-full text-lg py-6">
              <Link href="/planos">
                Ver Planos e Preços
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Ou, se preferir, faça uma{' '}
              <Link href="/checkout?tipo=CONSULTA" className="text-primary underline">
                consulta avulsa por R$ 149
              </Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </Link>

        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="py-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm">
              Você é associado <strong>{assinatura.plano.nome}</strong> - aproveite o desconto na primeira consulta!
            </span>
          </CardContent>
        </Card>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Agendar Consulta
          </h1>
          <p className="text-muted-foreground">
            Escolha a modalidade de atendimento que prefere
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <Card className="border-2 border-primary">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Teleconsulta</CardTitle>
                  <CardDescription>Atendimento online</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">R$ 99</span>
                  <span className="text-sm text-muted-foreground line-through">R$ 149</span>
                </div>
                <Badge variant="outline" className="mt-1 text-primary border-primary/50">
                  Preço de associado
                </Badge>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Consultas de 30-60 minutos
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Horários flexíveis
                </li>
              </ul>
              
              <Button 
                onClick={() => handleAgendar('teleconsulta')} 
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Agendar via WhatsApp
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Presencial</CardTitle>
                  <CardDescription>Em uma clínica parceira</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">R$ 99</span>
                  <span className="text-sm text-muted-foreground line-through">R$ 149</span>
                </div>
                <Badge variant="outline" className="mt-1 text-primary border-primary/50">
                  Preço de associado
                </Badge>
              </div>

              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  Consultas de 45-90 minutos
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Conforme disponibilidade local
                </li>
              </ul>
              
              <Button 
                variant="outline"
                onClick={() => handleAgendar('presencial')} 
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Solicitar Agendamento
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Dúvidas? Entre em contato pelo email{' '}
              <a href="mailto:ouvidoria@abracanm.org.br" className="text-primary underline">
                ouvidoria@abracanm.org.br
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
            <DialogDescription>
              Você será redirecionado para o WhatsApp para finalizar o agendamento da sua {selectedModalidade === 'teleconsulta' ? 'teleconsulta' : 'consulta presencial'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Modalidade:</span>
              <span className="font-medium capitalize">{selectedModalidade}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium text-primary">R$ 99,00</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duração:</span>
              <span className="font-medium">
                {selectedModalidade === 'teleconsulta' ? '30-60 min' : '45-90 min'}
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarAgendamento}>
              <Phone className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
