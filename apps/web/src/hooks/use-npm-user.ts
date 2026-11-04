import type { NormalizedNpmUser } from "@ossintel/npm";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import { fetchWithCache } from "@/lib/api-client";

export const useNpmUser = (username: string) => {
  const cleanUsername = username?.trim();
  const isRefreshingRef = useRef(false);

  const query = useQuery({
    queryKey: ["npm-user", cleanUsername?.toLowerCase()],
    queryFn: async () => {
      const forceRefresh = isRefreshingRef.current;
      try {
        const data = await fetchWithCache<NormalizedNpmUser>(
          `npm-user:${cleanUsername.toLowerCase()}`,
          "/api/npm/user",
          {
            query: cleanUsername,
          },
          forceRefresh,
        );
        return data;
      } finally {
        isRefreshingRef.current = false;
      }
    },
    enabled: !!cleanUsername,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanUsername) return;
    isRefreshingRef.current = true;
    await query.refetch();
  };

  return { ...query, refresh };
};
