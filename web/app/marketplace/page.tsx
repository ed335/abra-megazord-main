'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Award,
  Stethoscope,
  Calendar,
  ChevronRight,
  Loader2,
  User,
  BadgeCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/shared/Header';

interface Medico {
  id: string;
  nome: string;
  especialidade: string;
  especialidades: string[];
  crm: string;
  fotoUrl: string | null;
  bio: string | null;
  experiencia: string | null;
  consultaValor: number | null;
  duracaoConsulta: number;
  consultasRealizadas: number;
}

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [medicoSelecionado, setMedicoSelecionado] = useState<Medico | null>(null);

  useEffect(() => {
    fetchMedicos();
  }, [filtroEspecialidade]);

  const fetchMedicos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filtroEspecialidade) params.set('especialidade', filtroEspecialidade);
      if (busca) params.set('busca', busca);
      
      const response = await fetch(`/api/marketplace/medicos?${params}`);
      const data = await response.json();
      
      setMedicos(data.medicos || []);
      setEspecialidades(data.especialidades || []);
    } catch (error) {
      console.error('Erro ao buscar médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicos();
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-20">
        <div className="bg-gradient-to-br from-verde-oliva to-verde-oliva/80 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Encontre seu Médico Especialista
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Escolha entre nossos médicos credenciados especializados em cannabis medicinal
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou especialidade..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-verde-oliva hover:bg-verde-oliva/90"
                >
                  Buscar
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={!filtroEspecialidade ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroEspecialidade('')}
              className={!filtroEspecialidade ? 'bg-verde-oliva hover:bg-verde-oliva/90' : ''}
            >
              Todos
            </Button>
            {especialidades.map((esp) => (
              <Button
                key={esp}
                variant={filtroEspecialidade === esp ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroEspecialidade(esp)}
                className={filtroEspecialidade === esp ? 'bg-verde-oliva hover:bg-verde-oliva/90' : ''}
              >
                {esp}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-verde-oliva" />
            </div>
          ) : medicos.length === 0 ? (
            <div className="text-center py-20">
              <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-800 mb-2">
                Nenhum médico disponível
              </h2>
              <p className="text-gray-500">
                Não encontramos médicos com os critérios selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicos.map((medico, index) => (
                <motion.div
                  key={medico.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setMedicoSelecionado(medico)}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-20 h-20 bg-verde-oliva/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {medico.fotoUrl ? (
                            <img 
                              src={medico.fotoUrl} 
                              alt={medico.nome}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-verde-oliva" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">
                              {medico.nome}
                            </h3>
                            <BadgeCheck className="w-5 h-5 text-verde-oliva flex-shrink-0" />
                          </div>
                          <p className="text-verde-oliva font-medium text-sm">
                            {medico.especialidade}
                          </p>
                          <p className="text-gray-500 text-xs">
                            CRM: {medico.crm}
                          </p>
                        </div>
                      </div>

                      {medico.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {medico.bio}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {medico.experiencia && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            {medico.experiencia}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {medico.duracaoConsulta} min
                        </Badge>
                        {medico.consultasRealizadas > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {medico.consultasRealizadas} consultas
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Valor da consulta</p>
                          <p className="text-2xl font-bold text-verde-oliva">
                            {medico.consultaValor ? formatPrice(medico.consultaValor) : 'A consultar'}
                          </p>
                        </div>
                        <Button 
                          className="bg-verde-oliva hover:bg-verde-oliva/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMedicoSelecionado(medico);
                          }}
                        >
                          Ver Perfil
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {medicoSelecionado && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setMedicoSelecionado(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-6 border-b border-gray-100">
                <button
                  onClick={() => setMedicoSelecionado(null)}
                  className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-verde-oliva/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {medicoSelecionado.fotoUrl ? (
                      <img 
                        src={medicoSelecionado.fotoUrl} 
                        alt={medicoSelecionado.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-verde-oliva" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {medicoSelecionado.nome}
                      </h2>
                      <BadgeCheck className="w-5 h-5 text-verde-oliva" />
                    </div>
                    <p className="text-verde-oliva font-medium">
                      {medicoSelecionado.especialidade}
                    </p>
                    <p className="text-gray-500 text-sm">
                      CRM: {medicoSelecionado.crm}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {medicoSelecionado.bio && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Sobre</h3>
                    <p className="text-gray-600">{medicoSelecionado.bio}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {medicoSelecionado.experiencia && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-verde-oliva" />
                      {medicoSelecionado.experiencia}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-verde-oliva" />
                    Consulta de {medicoSelecionado.duracaoConsulta} minutos
                  </div>
                  {medicoSelecionado.consultasRealizadas > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-verde-oliva" />
                      {medicoSelecionado.consultasRealizadas} consultas realizadas
                    </div>
                  )}
                </div>

                {medicoSelecionado.especialidades.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Especialidades</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{medicoSelecionado.especialidade}</Badge>
                      {medicoSelecionado.especialidades.map((esp) => (
                        <Badge key={esp} variant="outline">{esp}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-verde-oliva/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Valor da consulta</p>
                      <p className="text-3xl font-bold text-verde-oliva">
                        {medicoSelecionado.consultaValor 
                          ? formatPrice(medicoSelecionado.consultaValor) 
                          : 'A consultar'}
                      </p>
                    </div>
                  </div>
                  
                  <Link href={`/agendar?medico=${medicoSelecionado.id}`}>
                    <Button className="w-full bg-verde-oliva hover:bg-verde-oliva/90 py-3">
                      <Calendar className="w-5 h-5 mr-2" />
                      Agendar Consulta
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </>
  );
}
