'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { API_URL, setToken } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roles = [
  { value: 'PACIENTE', label: 'Paciente' },
  { value: 'PRESCRITOR', label: 'Prescritor' },
] as const;

export default function CadastroClient() {
  const [role, setRole] = useState<'PACIENTE' | 'PRESCRITOR'>('PACIENTE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao cadastrar');
      }

      const data = await response.json();
      if (data.accessToken) {
        setToken(data.accessToken);
        toast.success('Cadastro realizado com sucesso!');
        setTimeout(() => router.push('/dashboard'), 500);
        return;
      }

      toast.success('Cadastro realizado com sucesso!');
      setTimeout(() => router.push('/login'), 500);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao cadastrar';
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-16">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Link href="/" className="text-sm text-primary font-medium mb-2 inline-block">
            ABRACANM
          </Link>
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <CardDescription>
            Cadastre-se para acessar a plataforma
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Tipo de conta</Label>
              <div className="flex gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all border ${
                      role === r.value
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input text-foreground hover:bg-accent'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

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
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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
                  Cadastrando...
                </>
              ) : (
                'Criar conta'
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
