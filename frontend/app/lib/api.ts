/**
 * Centralised API client. Defines all endpoint paths in one place and provides
 * fetch helpers for client-side and server-side use.
 *
 * All paths in `routes` are relative so they flow through the Next.js rewrite
 * proxy (/api/* → backend). `serverFetch` is the exception: server components
 * bypass the proxy, so it prepends NEXT_PUBLIC_API_URL directly.
 */

export const routes = {
  posts: {
    likes: (slug: string, anonymousId: string) =>
      `/api/posts/${slug}/likes?anonymous_id=${anonymousId}`,
    like: (slug: string) => `/api/posts/${slug}/like`,
    comments: (slug: string) => `/api/posts/${slug}/comments`,
    comment: (slug: string) => `/api/posts/${slug}/comment`,
  },
  search: {
    posts: (q: string, tags?: string[], limit?: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (limit !== undefined) params.set("limit", String(limit));
      tags?.forEach((tag) => params.append("tags", tag));
      return `/api/search?${params.toString()}`;
    },
    suggest: (q: string) => `/api/search/suggest?q=${encodeURIComponent(q)}`,
  },
  tags: {
    aggregations: () => `/api/tags/aggregations`,
  },
  admin: {
    comments: (status?: string) =>
      status ? `/api/admin/comments?status=${status}` : `/api/admin/comments`,
    comment: (id: string) => `/api/admin/comments/${id}`,
    travel: () => `/api/admin/travel`,
  },
  auth: {
    session: () => `/api/auth/get-session`,
  },
};

/** Client-side fetch wrapper. Returns parsed JSON or throws on non-ok status. */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await (options !== undefined
    ? fetch(path, options)
    : fetch(path));
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Server-side fetch wrapper. Prepends NEXT_PUBLIC_API_URL (required because
 * Next.js rewrites do not apply to server-side fetches), forwards cookies, and
 * disables caching.
 */
export async function serverFetch<T>(
  path: string,
  cookieHeader?: string
): Promise<T> {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}
