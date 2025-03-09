import { ItemIcon } from '@/components/ui/item-icon';
import { ItemPopover } from '@/components/ui/item-popover';
import { getRarityColor, type Rarity } from '@/components/ui/rarity';
import { useItem } from '@/lib/hooks/use-item';
import { cn } from '@/lib/utils';

interface ItemRewardProps {
  itemId: string;
  quantity: number;
  className?: string;
  showPopover?: boolean;
}

export function ItemReward({
  itemId,
  quantity,
  className,
  showPopover = true,
}: ItemRewardProps) {
  const { item, isLoading } = useItem(itemId);
  const displayName = isLoading ? itemId : item?.name || itemId;

  const content = (
    <div
      className={cn(
        'flex cursor-default items-center gap-1 rounded-md px-1.5 py-0.5 text-2xs font-medium',
        item?.rarity && getRarityColor(item.rarity as Rarity),
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
    <ItemPopover
      item={{
        id: itemId,
        name: item.name,
        description: item.description || undefined,
        rarity: item.rarity,
        item_type: item.item_type,
        stat_bonuses: item.stat_bonuses as Record<string, number> | undefined,
      }}
      quantity={quantity}
    >
      {content}
    </ItemPopover>
  );
}
