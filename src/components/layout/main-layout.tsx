import { DesktopNav } from '@/components/ui/desktop-nav';
import { MobileNav } from '@/components/ui/mobile-nav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Desktop Navigation */}
      <DesktopNav />

      {/* Main Content */}
      <main className='pb-16 md:pb-0 md:pl-16'>{children}</main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
