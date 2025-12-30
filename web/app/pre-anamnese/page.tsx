'use client';

import { Suspense } from 'react';
import PatientQuizWizardV2 from '@/components/quiz/PatientQuizWizardV2';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-[#3FA174] animate-spin" />
    </div>
  );
}

export default function PreAnamnesePage() {
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
