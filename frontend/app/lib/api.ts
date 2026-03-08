/**
 * API client helpers. Centralizes the backend base URL and endpoint paths so
 * they can be updated in one place.
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";

export const api = {
  posts: {
    likes: (slug: string, anonymousId: string) =>
      `${baseUrl}/api/posts/${slug}/likes?anonymous_id=${anonymousId}`,
    like: (slug: string) => `${baseUrl}/api/posts/${slug}/like`,
    comments: (slug: string) => `${baseUrl}/api/posts/${slug}/comments`,
    comment: (slug: string) => `${baseUrl}/api/posts/${slug}/comment`,
  },
  travel: () => `${baseUrl}/api/travel`,
  admin: {
    login: () => `${baseUrl}/api/admin/login`,
    logout: () => `${baseUrl}/api/admin/logout`,
    comments: (status?: string) =>
      status
        ? `${baseUrl}/api/admin/comments?status=${status}`
        : `${baseUrl}/api/admin/comments`,
    updateComment: (id: string) => `${baseUrl}/api/admin/comments/${id}`,
    travel: () => `${baseUrl}/api/admin/travel`,
  },
};
