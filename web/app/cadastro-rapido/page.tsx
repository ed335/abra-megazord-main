'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setToken } from '@/lib/auth';
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

function formatWhatsApp(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

export default function CadastroRapidoPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [consenteLGPD, setConsenteLGPD] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (senha.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (!consenteLGPD) {
      toast.error('Você precisa aceitar os termos para continuar');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register-quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          email, 
          whatsapp: whatsapp.replace(/\D/g, ''), 
          senha,
          consenteLGPD 
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar');
      }

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        toast.success('Cadastro realizado com sucesso!');
        router.push('/dashboard');
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao cadastrar';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 py-12 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <Link href="/" className="text-sm text-[#3FA174] font-semibold mb-2 inline-block">
            ABRACANM
          </Link>
          <CardTitle className="text-2xl font-bold text-gray-900">Criar sua conta</CardTitle>
          <CardDescription className="text-gray-600">
            Comece sua jornada de saúde em poucos segundos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-gray-700">Nome completo</Label>
              <Input
                id="nome"
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="border-gray-200 focus:border-[#3FA174] focus:ring-[#3FA174]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                className="border-gray-200 focus:border-[#3FA174] focus:ring-[#3FA174]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-gray-700">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                placeholder="(11) 99999-9999"
                className="border-gray-200 focus:border-[#3FA174] focus:ring-[#3FA174]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-700">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className="border-gray-200 focus:border-[#3FA174] focus:ring-[#3FA174] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha" className="text-gray-700">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  className="border-gray-200 focus:border-[#3FA174] focus:ring-[#3FA174] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {senha && confirmarSenha && senha === confirmarSenha && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 size={12} />
                  <span>Senhas coincidem</span>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="consenteLGPD"
                checked={consenteLGPD}
                onChange={(e) => setConsenteLGPD(e.target.checked)}
                className="mt-1 w-4 h-4 text-[#3FA174] border-gray-300 rounded focus:ring-[#3FA174]"
              />
              <label htmlFor="consenteLGPD" className="text-sm text-gray-600">
                Li e concordo com os{' '}
                <Link href="/termos-uso" target="_blank" className="text-[#3FA174] hover:underline">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link href="/politica-privacidade" target="_blank" className="text-[#3FA174] hover:underline">
                  Política de Privacidade
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#3FA174] hover:bg-[#359966] text-white font-medium py-5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Criando conta...
                </>
              ) : (
                'Criar minha conta'
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <p className="text-sm text-center text-gray-600">
              Já tem conta?{' '}
              <Link href="/login" className="text-[#3FA174] hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
