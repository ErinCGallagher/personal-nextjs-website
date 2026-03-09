/** Handles authentication errors from backend API responses by redirecting to login */

import { redirect } from "next/navigation";

/**
 * Checks fetch response for authentication errors and redirects if needed
 *
 * @param response - Fetch Response object from backend API call
 * @returns The response unchanged if successful
 * @throws Error if response status is not OK (and not 401)
 * @throws Redirect to /admin if response status is 401
 */
export function handleAuthResponse(response: Response): Response {
  if (response.status === 401) {
    redirect("/admin");
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response;
}
