import { z } from "zod";

const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/);

export const likesQuerySchema = z.object({
  slug: slugSchema,
  anonymous_id: z.uuid().optional(),
});

export const likeBodySchema = z.object({
  slug: slugSchema,
  anonymous_id: z.uuid(),
});