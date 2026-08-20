'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { accessToken, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(accessToken ? '/dashboard' : '/login');
  }, [hasHydrated, accessToken, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="eyebrow">Loading Dispatch…</p>
    </div>
  );
}
