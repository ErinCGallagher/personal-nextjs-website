/**
 * Configuration management for the backend application.
 * Validates environment variables and exports typed configuration object.
 */

import { z } from "zod";

const configSchema = z
  .object({
    AI_REVIEW_ENABLED: z
      .string()
      .optional()
      .default("false")
      .transform((val) => val === "true"),
    AI_REVIEW_PROVIDER: z.string().optional().default("gemini"),
    GEMINI_API_KEY: z.string().optional(),
    AI_AUTO_APPROVE_ENABLED: z
      .string()
      .optional()
      .default("true")
      .transform((val) => val === "true"),
    AI_AUTO_APPROVE_THRESHOLD: z
      .string()
      .optional()
      .default("0.9")
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 0 && val <= 1, {
        message: "AI_AUTO_APPROVE_THRESHOLD must be between 0 and 1",
      }),
  })
  .refine(
    (config) => {
      if (config.AI_AUTO_APPROVE_ENABLED && !config.AI_REVIEW_ENABLED) {
        return false;
      }
      return true;
    },
    {
      message:
        "Cannot enable AI_AUTO_APPROVE_ENABLED without enabling AI_REVIEW_ENABLED",
    }
  )
  .refine(
    (config) => {
      if (config.AI_REVIEW_ENABLED && !config.GEMINI_API_KEY) {
        return false;
      }
      return true;
    },
    {
      message: "GEMINI_API_KEY is required when AI_REVIEW_ENABLED is true",
    }
  );

const parseConfig = () => {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Configuration validation failed:");
    console.error(result.error.issues);
    throw new Error(
      `Invalid configuration: ${result.error.issues.map((e) => e.message).join(", ")}`
    );
  }

  return result.data;
};

export const config = parseConfig();

console.log("[Config] AI Review:", config.AI_REVIEW_ENABLED ? "enabled" : "disabled");
if (config.AI_REVIEW_ENABLED) {
  console.log("[Config] AI Provider:", config.AI_REVIEW_PROVIDER);
  console.log(
    "[Config] AI Auto-Approve:",
    config.AI_AUTO_APPROVE_ENABLED ? `enabled (threshold: ${config.AI_AUTO_APPROVE_THRESHOLD})` : "disabled"
  );
}
