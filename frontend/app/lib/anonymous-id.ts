/**
 * Utility for generating and persisting an anonymous user identifier.
 * The ID is stored in localStorage and used for casual deduplication
 * (e.g. likes, comments) without requiring a login.
 */

export function getAnonymousId(): string {
  let id = localStorage.getItem("anonymous_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("anonymous_id", id);
  }
  return id;
}
