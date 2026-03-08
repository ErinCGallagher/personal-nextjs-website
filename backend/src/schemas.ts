import { z } from "zod";

const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/);

export const likesQuerySchema = z.object({
  slug: slugSchema,
  anonymous_id: z.uuid().optional(),
});

export const likeBodySchema = z.object({
  slug: slugSchema,
  anonymous_id: z.uuid(),
});

export const commentsQuerySchema = z.object({
  slug: slugSchema,
});

export const commentBodySchema = z.object({
  slug: slugSchema,
  anonymous_id: z.uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  body: z.string().min(1).max(5000),
});

export const travelEntrySchema = z.object({
  date: z.string().date(),
  country: z.string().max(100).trim(),
  city: z.string().max(100).trim(),
  hotel: z.string().max(255).trim().nullable(),
  notes: z.string().trim().nullable(),
});
