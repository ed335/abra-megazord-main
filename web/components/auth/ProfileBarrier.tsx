'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, fetchWithAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

interface ProfileBarrierProps {
  children: ReactNode;
}

export function ProfileBarrier({ children }: ProfileBarrierProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const checkProfile = async () => {
      const token = getToken();
      
      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const userData = await fetchWithAuth<{ 
          onboardingCompleto: boolean;
          role: string;
        }>('/api/auth/me');

        if (userData.role === 'ADMIN' || userData.role === 'MEDICO') {
          setIsProfileComplete(true);
          setIsLoading(false);
          return;
        }

        if (!userData.onboardingCompleto) {
          router.replace('/onboarding');
          return;
        }

        setIsProfileComplete(true);
        setIsLoading(false);
      } catch (error) {
        router.replace('/login');
      }
    };

    checkProfile();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#38840e] mx-auto mb-4" />
          <p className="text-gray-500">Verificando seu perfil...</p>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return null;
  }

  return <>{children}</>;
}
