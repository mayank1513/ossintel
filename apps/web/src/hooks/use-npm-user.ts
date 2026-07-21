import type { NormalizedNpmUser } from "@ossintel/npm";
import { useQuery } from "@tanstack/react-query";
import { clearCacheItem, fetchWithCache } from "@/lib/api-client";

export const useNpmUser = (username: string) => {
  const cleanUsername = username?.trim();
  const query = useQuery({
    queryKey: ["npm-user", cleanUsername?.toLowerCase()],
    queryFn: () =>
      fetchWithCache<NormalizedNpmUser>(
        `npm-user:${cleanUsername.toLowerCase()}`,
        "/api/npm/user",
        {
          query: cleanUsername,
        },
      ),
    enabled: !!cleanUsername,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanUsername) return;
    const cacheKey = `npm-user:${cleanUsername.toLowerCase()}`;
    await clearCacheItem(cacheKey);
    await query.refetch();
  };

  return { ...query, refresh };
};
