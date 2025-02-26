'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This is a placeholder for authentication check
// In a real app, you would use your authentication system
const useAuth = () => {
  // Placeholder for auth state
  return { isAuthenticated: true, isLoading: false };
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent'></div>
      </div>
    );
  }

  // If authenticated, show the app layout
  if (isAuthenticated) {
    return <MainLayout>{children}</MainLayout>;
  }

  // This should never be shown due to the redirect
  return null;
}
