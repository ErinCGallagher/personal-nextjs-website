/**
 * Middleware factory for validating incoming request data against a Zod schema.
 * Merges req.params, req.query, and req.body, then validates the combined object.
 * On success, stores the parsed data in res.locals.validated and calls next().
 * On failure, responds with 400 and a structured Zod error.
 */
import { RequestHandler } from "express";
import { z } from "zod";

export function validateRequest(schema: z.ZodTypeAny): RequestHandler {
  return (req, res, next) => {
    // Params take highest precedence to prevent body/query from overriding URL parameters.
    const data = { ...req.body, ...req.query, ...req.params };
    const result = schema.safeParse(data);

    if (!result.success) {
      res.status(400).json({ error: z.treeifyError(result.error) });
      return;
    }

    res.locals.validated = result.data;
    next();
  };
}
