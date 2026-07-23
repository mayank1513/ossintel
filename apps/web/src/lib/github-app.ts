import { unstable_cache } from "next/cache";
import { App } from "octokit";

interface InstallationItem {
  login: string;
  id: number;
}

// 1. Fetch installations list directly from GitHub API
async function fetchInstallationsRaw(): Promise<InstallationItem[]> {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appId || !privateKey) {
    return [];
  }

  try {
    const app = new App({
      appId,
      privateKey,
    });
    const installations = await app.octokit.paginate("GET /app/installations", {
      per_page: 100,
    });

    const list: InstallationItem[] = [];
    for (const inst of installations) {
      if (inst.account?.login) {
        list.push({
          login: inst.account.login.toLowerCase(),
          id: inst.id,
        });
      }
    }
    return list;
  } catch (error) {
    console.error("Failed to fetch GitHub App installations list", error);
    return [];
  }
}

// 2. Wrap installations retrieval in Next.js unstable_cache
const getCachedInstallationsList = unstable_cache(
  async () => {
    return fetchInstallationsRaw();
  },
  ["github-app-installations"],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ["github-app-installations"],
  },
);

// 3. Public API
export async function getInstallationMap(): Promise<Map<string, number>> {
  const list = await getCachedInstallationsList();
  const map = new Map<string, number>();
  for (const item of list) {
    map.set(item.login, item.id);
  }
  return map;
}

export async function getInstallationId(
  login: string,
): Promise<number | undefined> {
  const map = await getInstallationMap();
  return map.get(login.toLowerCase());
}

export async function getInstallationToken(
  login: string,
): Promise<string | undefined> {
  const installationId = await getInstallationId(login);
  if (!installationId) return undefined;

  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!appId || !privateKey) {
    return undefined;
  }

  try {
    const app = new App({
      appId,
      privateKey,
    });
    const response = await app.octokit.request(
      "POST /app/installations/{installation_id}/access_tokens",
      {
        installation_id: installationId,
      },
    );
    return response.data.token;
  } catch (error) {
    console.error(
      `Failed to generate installation token for login ${login}`,
      error,
    );
    return undefined;
  }
}
