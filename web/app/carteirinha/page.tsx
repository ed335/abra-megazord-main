'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import AppLayout from '@/components/layout/AppLayout';
import { CarteirinhaFlip } from '@/components/ui/carteirinha-flip';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Download, Share2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  nome: string;
  cpf?: string;
  matricula?: string;
  plano?: string;
  validade?: string;
  foto?: string;
  status?: 'ativo' | 'pendente' | 'inativo';
  nascimento?: string;
}

function CarteirinhaSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <Skeleton className="h-16 w-full" />
          <div className="p-5">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-28 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CarteirinhaPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace('/login');
      return;
    }

    fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Sessão inválida');
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [router]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Carteirinha ABRACANM',
        text: `Sou associado da ABRACANM - Associação Brasileira de Cannabis Medicinal`,
      });
    } catch {
      toast.info('Compartilhamento não disponível neste dispositivo');
    }
  };

  const handleDownload = () => {
    toast.info('Funcionalidade em desenvolvimento', {
      description: 'Em breve você poderá baixar sua carteirinha em PDF.'
    });
  };

  if (loading) {
    return (
      <AppLayout title="Minha Carteirinha">
        <CarteirinhaSkeleton />
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout title="Minha Carteirinha">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-[#1d1d1f] font-medium mb-1">Erro ao carregar</p>
          <p className="text-[#86868b] text-sm mb-4">Não foi possível carregar sua carteirinha</p>
          <Button onClick={() => router.push('/login')}>Fazer login</Button>
        </div>
      </AppLayout>
    );
  }

  const associadoData = {
    nome: user.nome || 'Associado ABRACANM',
    matricula: user.matricula || `ABR-${user.id?.slice(0, 5).toUpperCase() || '00000'}`,
    cpf: user.cpf,
    plano: user.plano || 'Plano Essencial',
    validade: user.validade || '12/2025',
    foto: user.foto,
    status: (user.status || 'ativo') as 'ativo' | 'pendente' | 'inativo',
    nascimento: user.nascimento,
  };

  return (
    <AppLayout title="Minha Carteirinha">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#1d1d1f]">Minha Carteirinha</h1>
            <p className="text-sm text-[#86868b]">Documento de identificação ABRACANM</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Baixar
            </Button>
          </div>
        </div>

        <CarteirinhaFlip associado={associadoData} />

        <div className="bg-[#fafaf8] rounded-xl p-4 border border-[#e5e5e5]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3FA174]/10 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-[#3FA174]" />
            </div>
            <div>
              <h3 className="font-medium text-[#1d1d1f] mb-1">Sobre sua carteirinha</h3>
              <p className="text-sm text-[#86868b] leading-relaxed">
                A carteirinha digital da ABRACANM é seu documento de identificação como associado. 
                Ela pode ser apresentada em farmácias, clínicas e órgãos de fiscalização para 
                comprovar sua condição de paciente em tratamento com cannabis medicinal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
