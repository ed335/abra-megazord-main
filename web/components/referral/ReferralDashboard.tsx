'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchWithAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Gift, 
  Trophy, 
  Share2, 
  Copy, 
  Check,
  ChevronRight,
  Sparkles
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

interface Indicado {
  nome: string;
  data: string;
}

interface Recompensa {
  id: string;
  tipo: string;
  descricao: string;
  valorDesconto: number | null;
  status: string;
}

interface DashboardData {
  codigoIndicacao: string | null;
  pontos: number;
  totalIndicacoes: number;
  nivel: NivelInfo & { atual: boolean };
  proximoNivel: ProximoNivel | null;
  indicadosRecentes: Indicado[];
  recompensasDisponiveis: Recompensa[];
}

export function ReferralDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  const gerarCodigo = async () => {
    setGenerating(true);
    try {
      const result = await fetchWithAuth<{ codigoIndicacao: string }>('/api/indicacao', { method: 'POST' });
      setData(prev => prev ? { ...prev, codigoIndicacao: result.codigoIndicacao } : null);
    } catch (error) {
      console.error('Erro ao gerar código:', error);
    } finally {
      setGenerating(false);
    }
  };

  const copiarLink = async () => {
    if (!data?.codigoIndicacao) return;
    
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/cadastro?ref=${data.codigoIndicacao}`;
    
    try {
      await navigator.clipboard.writeText(link);
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
        copiarLink();
      }
    } else {
      copiarLink();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-xl"></div>
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  const progresso = data?.proximoNivel 
    ? ((data.totalIndicacoes - (data.nivel.minIndicacoes || 0)) / 
       ((data.proximoNivel.minIndicacoes || 1) - (data.nivel.minIndicacoes || 0))) * 100
    : 100;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Programa de Indicação
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              Indique amigos e ganhe recompensas
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{data?.nivel.emoji}</div>
            <div className="text-sm font-medium">{data?.nivel.nome}</div>
          </div>
        </div>

        {data?.codigoIndicacao ? (
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
            <div className="text-sm text-emerald-100 mb-2">Seu código de indicação:</div>
            <div className="flex items-center gap-3">
              <div className="flex-1 font-mono text-2xl font-bold tracking-wider">
                {data.codigoIndicacao}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={copiarLink}
                className="text-white hover:bg-white/20"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={compartilhar}
                className="text-white hover:bg-white/20"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={gerarCodigo}
            disabled={generating}
            className="w-full bg-white text-emerald-700 hover:bg-emerald-50"
          >
            {generating ? 'Gerando...' : 'Gerar Meu Código de Indicação'}
          </Button>
        )}

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.totalIndicacoes || 0}</div>
            <div className="text-xs text-emerald-100">Indicações</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.pontos || 0}</div>
            <div className="text-xs text-emerald-100">Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{data?.recompensasDisponiveis?.length || 0}</div>
            <div className="text-xs text-emerald-100">Recompensas</div>
          </div>
        </div>
      </motion.div>

      {data?.proximoNivel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Próximo Nível
            </h3>
            <span className="text-2xl">{data.proximoNivel.emoji}</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{data.nivel.nome}</span>
              <span className="text-gray-900 font-medium">{data.proximoNivel.nome}</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
          <p className="text-sm text-gray-500">
            Faltam <strong>{data.proximoNivel.indicacoesFaltando}</strong> indicações para 
            desbloquear {data.proximoNivel.beneficios[0]}
          </p>
        </motion.div>
      )}

      {data?.indicadosRecentes && data.indicadosRecentes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-emerald-600" />
            Indicados Recentes
          </h3>
          <div className="space-y-3">
            {data.indicadosRecentes.map((indicado, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 font-medium text-sm">
                      {indicado.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{indicado.nome}</span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(indicado.data).toLocaleDateString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {data?.recompensasDisponiveis && data.recompensasDisponiveis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100"
        >
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Suas Recompensas
          </h3>
          <div className="space-y-3">
            {data.recompensasDisponiveis.map((recompensa) => (
              <div key={recompensa.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{recompensa.descricao}</div>
                  <div className="text-sm text-amber-600">Disponível para uso</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {(!data?.indicadosRecentes || data.indicadosRecentes.length === 0) && data?.codigoIndicacao && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-xl p-6 text-center"
        >
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-700 mb-1">Nenhuma indicação ainda</h3>
          <p className="text-sm text-gray-500 mb-4">
            Compartilhe seu código com amigos e família para começar a ganhar recompensas!
          </p>
          <Button onClick={compartilhar} className="bg-emerald-600 hover:bg-emerald-700">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar Agora
          </Button>
        </motion.div>
      )}
    </div>
  );
}
