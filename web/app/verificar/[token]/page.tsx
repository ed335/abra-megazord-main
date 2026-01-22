'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Shield, Calendar, User, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface VerificacaoResult {
  valido: boolean;
  status?: 'ATIVO' | 'INATIVO';
  nomeAbreviado?: string;
  validade?: string;
  numero?: string;
  mensagem?: string;
  error?: string;
}

export default function VerificarCarteirinhaPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [resultado, setResultado] = useState<VerificacaoResult | null>(null);

  useEffect(() => {
    if (token) {
      verificarCarteirinha();
    }
  }, [token]);

  const verificarCarteirinha = async () => {
    try {
      const response = await fetch(`/api/carteirinha/verificar/${token}`);
      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({ valido: false, mensagem: 'Erro ao verificar carteirinha' });
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-abracanm-green/10 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-abracanm-green"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-abracanm-green/10 to-white flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <Image
            src="/logo-abracanm.svg"
            alt="ABRACANM"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-gray-900">Verificacao de Associado</h1>
        </div>

        {resultado?.valido && resultado.status === 'ATIVO' ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-green-600 mb-2">Associado Ativo</h2>
            <p className="text-gray-600 mb-6">{resultado.mensagem}</p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{resultado.nomeAbreviado}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Numero</p>
                  <p className="font-medium">{resultado.numero}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Validade</p>
                  <p className="font-medium">{resultado.validade ? formatarData(resultado.validade) : '-'}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : resultado?.valido && resultado.status === 'INATIVO' ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-yellow-600 mb-2">Associacao Inativa</h2>
            <p className="text-gray-600 mb-4">{resultado.mensagem}</p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{resultado.nomeAbreviado}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Numero</p>
                  <p className="font-medium">{resultado.numero}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-red-600 mb-2">Nao Encontrado</h2>
            <p className="text-gray-600">{resultado?.mensagem || 'Carteirinha nao encontrada no sistema.'}</p>
          </motion.div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Verificacao realizada em {new Date().toLocaleDateString('pt-BR')} as {new Date().toLocaleTimeString('pt-BR')}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            ABRACANM - Associacao Brasileira de Cannabis Medicinal
          </p>
        </div>
      </motion.div>
    </div>
  );
}
