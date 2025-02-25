import { DesktopNav } from "@/components/ui/desktop-nav";
import { MobileNav } from "@/components/ui/mobile-nav";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Navigation */}
      <DesktopNav />
      
      {/* Main Content */}
      <main className="pb-16 md:pl-16">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
} 