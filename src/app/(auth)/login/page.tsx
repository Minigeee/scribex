import { AuthForm } from '@/components/auth/auth-form';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account or create a new one',
};

interface LoginPageProps {
  searchParams?: { 
    tab?: string;
    callbackUrl?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if user is already logged in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // If user is already logged in, redirect to callback URL or dashboard
  if (data?.user) {
    const callbackUrl = searchParams?.callbackUrl || '/map';
    redirect(callbackUrl);
  }

  // Determine which tab to show by default
  const defaultTab = searchParams?.tab === 'register' ? 'register' : 'login';
  
  // Get the callback URL from query params or default to dashboard
  const callbackUrl = searchParams?.callbackUrl || '/map';

  return (
    <>
      <div className='flex flex-col space-y-2 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>Welcome to ScribeX</h1>
        <p className='text-sm text-muted-foreground'>
          Sign in to your account or create a new one
        </p>
      </div>
      <AuthForm 
        defaultTab={defaultTab as 'login' | 'register'} 
        callbackUrl={callbackUrl}
      />
    </>
  );
}
