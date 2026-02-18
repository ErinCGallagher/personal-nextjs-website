/**
 * API client helpers. Centralises the backend base URL and endpoint paths so
 * they can be updated in one place.
 */

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  posts: {
    likes: (slug: string) => `${baseUrl}/api/posts/${slug}/likes`,
    like: (slug: string) => `${baseUrl}/api/posts/${slug}/like`,
  },
};
