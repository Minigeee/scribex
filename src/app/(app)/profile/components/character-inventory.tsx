'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ItemIcon } from '@/components/ui/item-icon';
import { RarityBadge, type Rarity } from '@/components/ui/rarity';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ItemPopover } from '@/components/ui/item-popover';
import { Tables } from '@/lib/database.types';

interface InventoryItem extends Tables<'character_inventory'> {
  item_template: Tables<'item_templates'>;
}

interface CharacterInventoryProps {
  inventory: InventoryItem[];
}

export function CharacterInventory({ inventory }: CharacterInventoryProps) {
  // Group items by type
  const itemsByType = inventory.reduce(
    (acc, item) => {
      const type = item.item_template.item_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(item);
      return acc;
    },
    {} as Record<string, InventoryItem[]>
  );

  // Get unique item types
  const itemTypes = Object.keys(itemsByType);

  // Render a compact item
  const renderItem = (item: InventoryItem) => {
    const { item_template, equipped, quantity } = item;

    return (
      <ItemPopover
        key={item.id}
        item={{
          id: item_template.id || 'unknown',
          name: item_template.name,
          description: item_template.description || undefined,
          rarity: item_template.rarity,
          item_type: item_template.item_type,
          stat_bonuses: item_template.stat_bonuses as Record<string, number> | undefined,
        }}
        quantity={quantity}
        equipped={equipped}
        showEquipButton={true}
        onEquipToggle={() => {
          // TODO: Implement equip/unequip functionality
          console.log(`Toggle equip for item: ${item_template.name}`);
        }}
        hoverToOpen={false}
      >
        <div
          className={`relative rounded-md border px-3 py-2 ${equipped ? 'border-primary bg-primary/5' : 'border-border'} cursor-pointer transition-colors hover:bg-accent/50`}
        >
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <ItemIcon itemId={item_template.id || 'unknown'} size={24} />
              {equipped && (
                <div className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary' />
              )}
            </div>
            <div className='min-w-0 flex-1 space-y-1'>
              <div className='flex items-center justify-between'>
                <h4 className='max-w-[80px] truncate text-xs font-medium'>
                  {item_template.name}
                </h4>
                {quantity > 1 && (
                  <span className='ml-1 text-xs text-muted-foreground'>
                    x{quantity}
                  </span>
                )}
              </div>
              <div className='mt-0.5 flex items-center'>
                <RarityBadge
                  rarity={item_template.rarity as Rarity}
                  className='px-1 py-0 text-[0.6rem]'
                />
              </div>
            </div>
          </div>
        </div>
      </ItemPopover>
    );
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle>Inventory</CardTitle>
        <CardDescription>
          Your collection of items and equipment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className='py-6 text-center text-muted-foreground'>
            <p>Your inventory is empty</p>
            <p className='mt-1 text-sm'>Complete quests to earn items!</p>
          </div>
        ) : (
          <Tabs defaultValue={itemTypes[0]} className='w-full'>
            <TabsList className='mb-3'>
              {itemTypes.map((type) => (
                <TabsTrigger
                  key={type}
                  value={type}
                  className='text-xs capitalize'
                >
                  {type}
                </TabsTrigger>
              ))}
            </TabsList>

            {itemTypes.map((type) => (
              <TabsContent key={type} value={type}>
                <ScrollArea className='h-[350px] pr-4'>
                  <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                    {itemsByType[type].map(renderItem)}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
