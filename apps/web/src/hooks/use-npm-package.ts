import type { NormalizedNpmPackage } from "@ossintel/npm";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { fetchWithCache } from "@/lib/api-client";

export const useNpmPackage = (packageName: string) => {
  const cleanPackageName = packageName?.trim();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  const query = useQuery({
    queryKey: ["npm-package", cleanPackageName?.toLowerCase()],
    queryFn: async () => {
      const forceRefresh = isRefreshingRef.current;
      try {
        const data = await fetchWithCache<NormalizedNpmPackage>(
          `npm-package:${cleanPackageName.toLowerCase()}`,
          "/api/npm/package",
          {
            packageName: cleanPackageName,
          },
          forceRefresh,
        );
        return data;
      } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
      }
    },
    enabled: !!cleanPackageName,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanPackageName) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    await query.refetch();
  };

  return { ...query, refresh, isRefreshing };
};
