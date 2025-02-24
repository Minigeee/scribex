import { AuthForm } from '@/components/auth/auth-form';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account or create a new one',
};

interface LoginPageProps {
  searchParams?: { tab?: string };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // If user is already logged in, redirect to dashboard
  if (data?.user) {
    redirect('/dashboard');
  }

  // Determine which tab to show by default
  const defaultTab = searchParams?.tab === 'register' ? 'register' : 'login';

  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome to ScribeX</h1>
        <p className='text-sm text-muted-foreground'>
          Sign in to your account or create a new one
        </p>
      </div>
      <AuthForm defaultTab={defaultTab as 'login' | 'register'} />
    </>
  );
}
