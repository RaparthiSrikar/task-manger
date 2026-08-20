'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/field';
import { useLogin } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { accessToken, hasHydrated } = useAuthStore();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (hasHydrated && accessToken) router.replace('/dashboard');
  }, [hasHydrated, accessToken, router]);

  const onSubmit = (values: FormValues) => {
    login.mutate(values, { onSuccess: () => router.replace('/dashboard') });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Sign in</p>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-ink">Welcome back to Dispatch</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          {login.isError && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {getApiErrorMessage(login.error, 'Could not sign in')}
            </p>
          )}

          <Button type="submit" className="w-full" loading={login.isPending}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-navy hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
