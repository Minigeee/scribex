import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine';

export const RARITY_COLORS = {
  common: 'bg-gray-50 text-gray-700',
  uncommon: 'bg-green-50 text-green-700',
  rare: 'bg-blue-50 text-blue-700',
  epic: 'bg-purple-50 text-purple-700',
  legendary: 'bg-orange-50 text-orange-700',
  mythic: 'bg-rose-50 text-rose-700',
  divine: 'bg-teal-50 text-teal-700',
} as const;

interface RarityBadgeProps {
  rarity: Rarity;
  className?: string;
}

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  return (
    <Badge
      variant='default'
      className={cn('text-2xs capitalize', RARITY_COLORS[rarity], className)}
    >
      {rarity}
    </Badge>
  );
}

export function getRarityColor(rarity: Rarity) {
  return RARITY_COLORS[rarity];
}
