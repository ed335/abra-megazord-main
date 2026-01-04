'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '@/lib/auth';
import { 
  Gift, 
  Trophy, 
  Share2, 
  Copy, 
  Check,
  ChevronRight,
  Sparkles,
  Users
} from 'lucide-react';

interface NivelInfo {
  nivel: string;
  nome: string;
  emoji: string;
  minIndicacoes: number;
  maxIndicacoes: number | null;
  beneficios: string[];
  descontoConsulta: number;
}

interface ProximoNivel extends NivelInfo {
  indicacoesFaltando: number;
}

interface DashboardData {
  codigoIndicacao: string | null;
  pontos: number;
  totalIndicacoes: number;
  nivel: NivelInfo & { atual: boolean };
  proximoNivel: ProximoNivel | null;
}

export function ReferralWidget() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const result = await fetchWithAuth<DashboardData>('/api/indicacao');
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar indicações:', error);
    } finally {
      setLoading(false);
    }
  };

  const copiarCodigo = async () => {
    if (!data?.codigoIndicacao) return;
    
    try {
      await navigator.clipboard.writeText(data.codigoIndicacao);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const compartilhar = async () => {
    if (!data?.codigoIndicacao) return;
    
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/cadastro?ref=${data.codigoIndicacao}`;
    const texto = `Junte-se à ABRACANM e tenha acesso a tratamentos com cannabis medicinal! Use meu código: ${data.codigoIndicacao}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ABRACANM - Cannabis Medicinal',
          text: texto,
          url: link,
        });
      } catch (error) {
        copiarCodigo();
      }
    } else {
      copiarCodigo();
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 animate-pulse">
        <div className="h-24 bg-amber-100/50 rounded-xl" />
      </div>
    );
  }

  if (!data) return null;

  const progressoNivel = data.proximoNivel 
    ? ((data.totalIndicacoes - data.nivel.minIndicacoes) / 
       (data.proximoNivel.minIndicacoes - data.nivel.minIndicacoes)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 shadow-lg shadow-amber-100/50"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-orange-200/40 rounded-full blur-xl" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-amber-200">
                {data.nivel.emoji}
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#3FA174] rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900">{data.nivel.nome}</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-700 text-xs font-semibold rounded-full">
                  Nível {['SEMENTE', 'BROTO', 'FLORACAO', 'COLHEITA', 'EMBAIXADOR'].indexOf(data.nivel.nivel) + 1}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {data.totalIndicacoes} {data.totalIndicacoes === 1 ? 'indicação' : 'indicações'} • {data.pontos} pts
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/indicacao')}
            className="p-2 hover:bg-amber-100 rounded-xl transition-colors"
            title="Ver detalhes"
          >
            <ChevronRight className="w-5 h-5 text-amber-600" />
          </button>
        </div>

        {data.proximoNivel && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-500">Progresso para {data.proximoNivel.nome}</span>
              <span className="font-semibold text-amber-600">
                {data.proximoNivel.indicacoesFaltando} {data.proximoNivel.indicacoesFaltando === 1 ? 'indicação' : 'indicações'} restante
              </span>
            </div>
            <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressoNivel, 100)}%` }}
              />
            </div>
          </div>
        )}

        {data.nivel.descontoConsulta > 0 && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#3FA174]/10 border border-[#3FA174]/20 rounded-xl">
            <Gift className="w-4 h-4 text-[#3FA174]" />
            <span className="text-sm text-[#3FA174] font-medium">
              {data.nivel.descontoConsulta}% de desconto em consultas!
            </span>
          </div>
        )}

        {data.codigoIndicacao && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={copiarCodigo}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-amber-200 rounded-xl hover:bg-amber-50 transition-all text-sm font-semibold text-gray-700 group"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#3FA174]" />
                  <span className="text-[#3FA174]">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  <span className="font-mono tracking-wider">{data.codigoIndicacao}</span>
                </>
              )}
            </button>
            
            <button
              onClick={compartilhar}
              className="flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all text-sm font-semibold shadow-md shadow-amber-200 hover:shadow-lg hover:scale-[1.02]"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
              <span className="sm:hidden">Indicar</span>
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-amber-200/50">
          <button 
            onClick={() => router.push('/indicacao')}
            className="w-full flex items-center justify-center gap-2 text-sm text-amber-700 hover:text-amber-800 font-medium group"
          >
            <Trophy className="w-4 h-4" />
            <span>Ver minhas recompensas e indicações</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
