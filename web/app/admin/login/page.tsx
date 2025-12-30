'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setAdminToken } from '@/lib/admin-auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Credenciais invalidas');
      }

      if (data.user?.role !== 'ADMIN') {
        throw new Error('Acesso restrito a administradores');
      }

      if (data.access_token) {
        setAdminToken(data.access_token);
        router.push('/admin');
      } else {
        throw new Error('Token nao recebido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-verde-oliva/10 rounded-xl flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-verde-oliva" />
          </div>
          <Link href="/" className="text-2xl font-bold text-verde-oliva">
            ABRACANM
          </Link>
          <CardTitle className="text-xl mt-4">Painel Administrativo</CardTitle>
          <CardDescription>Entre com suas credenciais de administrador</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-cinza-escuro">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-cinza-claro rounded-xl text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none transition-all"
                placeholder="admin@abracanm.org.br"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-cinza-escuro">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-cinza-claro rounded-xl text-sm focus:ring-2 focus:ring-verde-oliva/20 focus:border-verde-oliva outline-none transition-all"
                placeholder="Sua senha"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-cinza-medio hover:text-verde-oliva transition-colors">
              Não é administrador? Acesse como associado
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
