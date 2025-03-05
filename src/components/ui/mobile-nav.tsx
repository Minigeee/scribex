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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.name}
            >
              <item.icon className='h-5 w-5' />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
