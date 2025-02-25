'use client';

import { cn } from '@/lib/utils';
import {
  MapIcon,
  PenSquareIcon,
  SparklesIcon,
  TrophyIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  {
    name: 'Map',
    href: '/map',
    icon: MapIcon,
    description: 'Level progression',
  },
  {
    name: 'Writing',
    href: '/writing',
    icon: PenSquareIcon,
    description: 'OWL projects',
  },
  {
    name: 'Creative',
    href: '/creative',
    icon: SparklesIcon,
    description: 'Inspiration & assistance',
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: TrophyIcon,
    description: 'Competitive rankings',
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    description: 'User settings',
  },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className='fixed left-0 top-0 z-30 hidden h-full w-16 flex-col border-r border-border/40 bg-background/80 backdrop-blur-md md:flex'>
        <div className='flex h-16 items-center justify-center border-b border-border/40'>
          <Link href='/map' className='flex items-center justify-center'>
            <span className='sr-only'>ScribexX</span>
            <div className='flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <span className='text-lg font-bold'>S</span>
            </div>
          </Link>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 py-8'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    aria-label={item.name}
                  >
                    <item.icon className='h-5 w-5' />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='right' className='flex flex-col'>
                  <span className='font-medium'>{item.name}</span>
                  <span className='text-xs text-muted-foreground'>
                    {item.description}
                  </span>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className='flex flex-col items-center justify-center border-t border-border/40 py-4'>
          <ThemeToggle />
        </div>
      </nav>
    </TooltipProvider>
  );
}
