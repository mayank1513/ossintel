import type { NormalizedNpmPackage } from "@ossintel/npm";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchWithCache } from "@/lib/api-client";

export const useNpmPackage = (packageName: string) => {
  const cleanPackageName = packageName?.trim();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useQuery({
    queryKey: ["npm-package", cleanPackageName?.toLowerCase()],
    queryFn: async () => {
      try {
        const data = await fetchWithCache<NormalizedNpmPackage>(
          `npm-package:${cleanPackageName.toLowerCase()}`,
          "/api/npm/package",
          {
            packageName: cleanPackageName,
          },
          isRefreshing,
        );
        return data;
      } finally {
        setIsRefreshing(false);
      }
    },
    enabled: !!cleanPackageName,
    retry: false,
  });

  const refresh = async () => {
    if (!cleanPackageName) return;
    setIsRefreshing(true);
    await query.refetch();
  };

  return { ...query, refresh };
};
