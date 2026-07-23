import { useQuery } from "@tanstack/react-query";

export interface AuthStatusResponse {
  hasGitHubPat: boolean;
  hasGithubPat: boolean;
  hasStackOverflowKey: boolean;
  login: string | null;
  organizations: string[];
}

export const useAuthStatus = () => {
  return useQuery<AuthStatusResponse>({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const res = await fetch("/api/auth/status", {
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch auth status");
      }
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false, // Do not auto refetch when tab is focused
    retry: false,
  });
};
