import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import { useQuery } from "@tanstack/react-query";
import { clearCacheItem, fetchWithCache } from "@/lib/api-client";

export const useStackOverflowUser = (userId: string) => {
  const cleanId = userId?.trim();

  // Retrieve stack exchange api key from session storage if present
  const apiKey =
    typeof window !== "undefined"
      ? sessionStorage.getItem("stackoverflow_api_key") || ""
      : "";

  const query = useQuery({
    queryKey: ["stackoverflow-user", cleanId, apiKey],
    queryFn: () =>
      fetchWithCache<NormalizedStackOverflowUser>(
        `stackoverflow-user:${cleanId}`,
        "/api/stackoverflow/user",
        {
          query: cleanId,
          apiKey,
        },
      ),
    enabled: !!cleanId,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanId) return;
    const cacheKey = `stackoverflow-user:${cleanId}`;
    await clearCacheItem(cacheKey);
    await query.refetch();
  };

  return { ...query, refresh };
};
