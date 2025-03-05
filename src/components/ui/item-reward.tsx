import { Badge } from '@/components/ui/badge';
import { ItemIcon } from '@/components/ui/item-icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useItem } from '@/lib/hooks/use-item';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ItemRewardProps {
  itemId: string;
  quantity: number;
  className?: string;
  showPopover?: boolean;
}

const RARITY_COLORS = {
  common: 'bg-gray-50 text-gray-700',
  uncommon: 'bg-green-50 text-green-700',
  rare: 'bg-blue-50 text-blue-700',
  epic: 'bg-purple-50 text-purple-700',
  legendary: 'bg-orange-50 text-orange-700',
  mythic: 'bg-rose-50 text-rose-700',
  divine: 'bg-teal-50 text-teal-700',
};

export function ItemReward({
  itemId,
  quantity,
  className,
  showPopover = true,
}: ItemRewardProps) {
  const { item, isLoading } = useItem(itemId);
  const [open, setOpen] = useState(false);

  const displayName = isLoading ? itemId : item?.name || itemId;

  const content = (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className={cn(
        'flex items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium cursor-default',
        item?.rarity && RARITY_COLORS[item?.rarity as keyof typeof RARITY_COLORS],
        className
      )}
    >
      <ItemIcon itemId={itemId} size={16} className='flex-shrink-0' />
      <span className='truncate'>
        {quantity > 1 ? `${quantity}x ` : ''}
        {displayName}
      </span>
    </div>
  );

  if (!showPopover || !item) {
    return content;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{content}</PopoverTrigger>
      <PopoverContent className='w-80 p-4'>
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md',
              RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
            )}
          >
            <ItemIcon itemId={itemId} size={32} />
          </div>
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium'>{item.name}</h4>
              <Badge
                variant='default'
                className={cn(
                  'text-2xs capitalize',
                  RARITY_COLORS[item.rarity as keyof typeof RARITY_COLORS]
                )}
              >
                {item.rarity}
              </Badge>
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              {item.description || `A ${item.item_type.toLowerCase()} item.`}
            </p>
            {item.stat_bonuses && Object.keys(item.stat_bonuses).length > 0 && (
              <div className='mt-2'>
                <h5 className='mb-1 text-2xs font-medium'>Stat Bonuses:</h5>
                <div className='grid grid-cols-2 gap-1'>
                  {Object.entries(
                    item.stat_bonuses as Record<string, number>
                  ).map(([stat, value]) => (
                    <div
                      key={stat}
                      className='flex items-center gap-1 text-2xs'
                    >
                      <span className='capitalize'>{stat}:</span>
                      <span className={cn('font-medium', value > 0 ? 'text-green-600' : 'text-red-600')}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className='mt-2 flex items-center justify-between text-2xs text-muted-foreground'>
              <span className='capitalize'>{item.item_type}</span>
              {quantity > 1 && <span>Quantity: {quantity}</span>}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
