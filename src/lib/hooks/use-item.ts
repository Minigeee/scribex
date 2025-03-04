import { Tables } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export type ItemTemplate = Tables<'item_templates'>;

/**
 * Hook to fetch item information by ID
 * @param itemId The ID of the item to fetch
 * @returns The item information and loading state
 */
export function useItem(itemId: string | undefined) {
  const supabase = createClient();

  const {
    data: item,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['item', itemId],
    queryFn: async () => {
      if (!itemId) return null;

      const { data, error } = await supabase
        .from('item_templates')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data as ItemTemplate;
    },
    enabled: !!itemId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    item,
    isLoading,
    error,
  };
}

/**
 * Hook to fetch multiple items by their IDs
 * @param itemIds Array of item IDs to fetch
 * @returns The items information and loading state
 */
export function useItems(itemIds: string[] | undefined) {
  const supabase = createClient();

  const {
    data: items,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['items', itemIds],
    queryFn: async () => {
      if (!itemIds || itemIds.length === 0) return [];

      const { data, error } = await supabase
        .from('item_templates')
        .select('*')
        .in('id', itemIds);

      if (error) throw error;
      return data as ItemTemplate[];
    },
    enabled: !!itemIds && itemIds.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    items,
    isLoading,
    error,
  };
} 