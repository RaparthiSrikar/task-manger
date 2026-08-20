'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-ink">Dispatch</span>
          <span className="eyebrow hidden sm:inline">task board</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/tasks/new">
            <Button variant="primary" className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" /> New task
            </Button>
          </Link>
          <span className="hidden text-sm text-muted md:inline">{user?.name}</span>
          <Button variant="ghost" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
