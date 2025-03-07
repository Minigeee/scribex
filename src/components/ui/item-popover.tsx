'use client';

import { ReactNode, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ItemIcon } from '@/components/ui/item-icon';
import { RarityBadge, getRarityColor, type Rarity } from '@/components/ui/rarity';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ItemDetails {
  id: string;
  name: string;
  description?: string;
  rarity: string;
  item_type: string;
  stat_bonuses?: Record<string, number>;
}

interface ItemPopoverProps {
  item: ItemDetails;
  quantity?: number;
  equipped?: boolean;
  children: ReactNode;
  showEquipButton?: boolean;
  onEquipToggle?: () => void;
  className?: string;
  /**
   * Whether to open the popover on hover. If false, will only open on click.
   * @default true
   */
  hoverToOpen?: boolean;
}

export function ItemPopover({
  item,
  quantity = 1,
  equipped = false,
  children,
  showEquipButton = false,
  onEquipToggle,
  className,
  hoverToOpen = true,
}: ItemPopoverProps) {
  const [open, setOpen] = useState(false);

  // Create hover handlers only if hoverToOpen is true
  const hoverProps = hoverToOpen
    ? {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
      }
    : {};

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild {...hoverProps}>
        {children}
      </PopoverTrigger>
      <PopoverContent className={cn('w-80 p-4', className)}>
        <div className='flex items-start gap-3'>
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md',
              getRarityColor(item.rarity as Rarity)
            )}
          >
            <ItemIcon itemId={item.id} size={32} />
          </div>
          <div className='flex-1'>
            <div className='flex items-center justify-between'>
              <h4 className='text-sm font-medium'>{item.name}</h4>
              <RarityBadge rarity={item.rarity as Rarity} />
            </div>
            <p className='mt-1 text-xs text-muted-foreground'>
              {item.description || `A ${item.item_type.toLowerCase()} item.`}
            </p>
            {item.stat_bonuses && Object.keys(item.stat_bonuses).length > 0 && (
              <div className='mt-2'>
                <h5 className='mb-1 text-2xs font-medium'>Stat Bonuses:</h5>
                <div className='grid grid-cols-2 gap-1'>
                  {Object.entries(item.stat_bonuses).map(([stat, value]) => (
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
            
            {showEquipButton && (
              <div className='mt-3 flex items-center justify-between'>
                {equipped && <Badge variant="outline" className="text-xs">Equipped</Badge>}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEquipToggle?.();
                  }}
                >
                  {equipped ? 'Unequip' : 'Equip'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 