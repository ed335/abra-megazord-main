'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setToken } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginClient() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao entrar');
      }

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        toast.success('Login realizado com sucesso!');
        
        let redirectPath = '/dashboard';
        if (data.user?.role === 'ADMIN') {
          redirectPath = '/admin';
        } else if (data.user?.role === 'PRESCRITOR') {
          redirectPath = '/medico';
        }
        
        setTimeout(() => router.push(redirectPath), 500);
      } else {
        toast.error('Erro ao obter token de acesso');
        setLoading(false);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao entrar';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-16 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-sm text-primary font-medium mb-2 inline-block">
            ABRACANM
          </Link>
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>
            Acesse sua conta para continuar sua jornada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Ainda não tem conta?{' '}
              <Link href="/cadastro/associado" className="text-primary hover:underline font-medium">
                Cadastre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
