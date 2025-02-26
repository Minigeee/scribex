"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapIcon, PenSquareIcon, SparklesIcon, TrophyIcon, UserIcon } from "lucide-react";

const navItems = [
  {
    name: "Map",
    href: "/map",
    icon: MapIcon,
    description: "Level progression",
  },
  {
    name: "Writing",
    href: "/writing",
    icon: PenSquareIcon,
    description: "OWL projects",
  },
  {
    name: "Creative",
    href: "/creative",
    icon: SparklesIcon,
    description: "Inspiration & assistance",
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: TrophyIcon,
    description: "Competitive rankings",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: UserIcon,
    description: "User settings",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-border/80 bg-background/80 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md p-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 