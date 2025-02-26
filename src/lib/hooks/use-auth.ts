import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const supabase = createClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const result = await supabase.auth.getUser();
      if (result.error) {
        throw result.error;
      }
      return result.data.user;
    },
  });

  return {
    user,
    isLoading,
  };
}
