'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import PatientQuizWizardV2 from '@/components/quiz/PatientQuizWizardV2';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#38840e] animate-spin" />
    </div>
  );
}

export default function PreAnamnesePage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

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
        if (!userData.onboardingCompleto && userData.role !== 'ADMIN' && userData.role !== 'MEDICO') {
          router.replace('/onboarding');
          return;
        }
        setIsAuthorized(true);
        setLoading(false);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <LoadingFallback />
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<LoadingFallback />}>
          <PatientQuizWizardV2 />
        </Suspense>
      </div>
    </main>
  );
}
