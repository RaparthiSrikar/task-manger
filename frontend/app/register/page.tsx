'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { FieldError, Input, Label } from '@/components/ui/field';
import { useRegister } from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const schema = z.object({
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { accessToken, hasHydrated } = useAuthStore();
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (hasHydrated && accessToken) router.replace('/dashboard');
  }, [hasHydrated, accessToken, router]);

  const onSubmit = (values: FormValues) => {
    registerUser.mutate(values, { onSuccess: () => router.replace('/dashboard') });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">Create account</p>
        <h1 className="mb-8 text-2xl font-semibold tracking-tight text-ink">Set up your board</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register('name')} />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
            <FieldError>{errors.email?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="At least 6 characters" {...register('password')} />
            <FieldError>{errors.password?.message}</FieldError>
          </div>

          {registerUser.isError && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {getApiErrorMessage(registerUser.error, 'Could not create account')}
            </p>
          )}

          <Button type="submit" className="w-full" loading={registerUser.isPending}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-navy hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
