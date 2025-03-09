'use client';

import { cn } from '@/lib/utils';
import {
  HomeIcon,
  NetworkIcon,
  MapIcon,
  TrophyIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className='fixed bottom-0 left-0 z-50 w-full border-t border-border/80 bg-background/80 backdrop-blur-md md:hidden'>
      <div className='mx-auto flex h-16 max-w-md items-center justify-around px-4'>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const gradientClass = navItemGradients[item.href] || 'from-gray-600 to-gray-800';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-all',
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.name}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                isActive 
                  ? `bg-gradient-to-br ${gradientClass} shadow-sm` 
                  : 'bg-transparent'
              )}>
                <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-current')} />
              </div>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
