import type { NormalizedStackOverflowUser } from "@ossintel/stackoverflow";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchWithCache } from "@/lib/api-client";

export const useStackOverflowUser = (userId: string) => {
  const cleanId = userId?.trim();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const query = useQuery({
    queryKey: ["stackoverflow-user", cleanId],
    queryFn: async () => {
      const forceRefresh = isRefreshingRef.current;
      try {
        const data = await fetchWithCache<NormalizedStackOverflowUser>(
          `stackoverflow-user:${cleanId}`,
          "/api/stackoverflow/user",
          {
            query: cleanId,
          },
          forceRefresh,
        );
        return data;
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    },
    enabled: !!cleanId,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanId) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    await query.refetch();
  };

  return { ...query, refresh, isRefreshing };
};
