import { z } from "zod";

export const likesQuerySchema = z.object({
  slug: z.string().min(1),
  anonymous_id: z.uuid().optional(),
});

export const likeBodySchema = z.object({
  slug: z.string().min(1),
  anonymous_id: z.uuid(),
});