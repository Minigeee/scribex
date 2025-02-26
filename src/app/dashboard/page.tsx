import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your dashboard',
};

export default async function DashboardPage() {
  // Check if user is logged in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // If user is not logged in, redirect to login
  if (!data?.user) {
    redirect('/login');
  }

  const user = data.user;

  return (
    <div className='container mx-auto py-10'>
      <div className='flex flex-col space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='text-3xl font-bold'>Dashboard</h1>
          <form action='/api/auth/signout' method='post'>
            <Button variant='outline'>Sign out</Button>
          </form>
        </div>
        <div className='rounded-lg border p-6'>
          <h2 className='mb-4 text-xl font-semibold'>Welcome, {user.email}</h2>
          <p className='mb-6 text-muted-foreground'>
            You are now signed in to your account.
          </p>
          <div className='flex space-x-4'>
            <Button asChild>
              <Link href='/profile'>View Profile</Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/'>Go to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
