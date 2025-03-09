'use client';

import { cn } from '@/lib/utils';
import {
  HomeIcon,
  MapIcon,
  NetworkIcon,
  PenToolIcon,
  TrophyIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip';

// Define gradient colors for each nav item
const navItemGradients: Record<string, string> = {
  '/dashboard': 'from-fuchsia-600 to-purple-800',
  '/skill-tree': 'from-cyan-600 to-blue-800',
  '/map': 'from-emerald-600 to-teal-800',
  '/social': 'from-amber-600 to-orange-800',
  '/profile': 'from-purple-600 to-indigo-800',
};

const navItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: HomeIcon,
    description: 'Dashboard with streaks & notifications',
  },
  {
    name: 'REDI',
    href: '/skill-tree',
    icon: NetworkIcon,
    description: 'Skill tree progression',
  },
  {
    name: 'OWL',
    href: '/map',
    icon: MapIcon,
    description: 'Open world map & quests',
  },
  {
    name: 'Social',
    href: '/social',
    icon: TrophyIcon,
    description: 'Factions & leaderboards',
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: UserIcon,
    description: 'Character profile & settings',
  },
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className='fixed left-0 top-0 z-30 hidden h-full w-16 flex-col border-r border-border/40 bg-background/80 backdrop-blur-md md:flex'>
        <div className='flex h-16 items-center justify-center border-b border-border/40'>
          <Link href='/' className='flex items-center justify-center'>
            <span className='sr-only'>ScribexX</span>
            <div className='flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-600 to-purple-800 text-white'>
              <PenToolIcon className='h-5 w-5' />
            </div>
          </Link>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 py-8'>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const gradientClass =
              navItemGradients[item.href] || 'from-gray-600 to-gray-800';

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-md transition-all',
                      isActive
                        ? `bg-gradient-to-br ${gradientClass} text-white shadow-md`
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                    aria-label={item.name}
                  >
                    <item.icon className='h-5 w-5' />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='right' className='flex flex-col'>
                  <span className='font-medium'>{item.name}</span>
                  <span className='text-xs'>{item.description}</span>
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
