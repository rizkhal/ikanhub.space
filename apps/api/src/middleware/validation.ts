import { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";

export const dimensionSchema = z.object({
  width: z.coerce.number().int().min(1).max(3000),
  height: z.coerce.number().int().min(1).max(3000),
});

export const sizeSchema = z.object({
  size: z.coerce.number().int().min(1).max(3000),
});

export function validateDimensions(width: number, height: number): string | null {
  if (isNaN(width) || isNaN(height)) {
    return "Width and height must be numbers";
  }
  if (width < 1 || width > 3000) {
    return "Width must be between 1 and 3000";
  }
  if (height < 1 || height > 3000) {
    return "Height must be between 1 and 3000";
  }
  return null;
}

export function handleError(c: Context, message: string, status: ContentfulStatusCode = 400) {
  return c.json({ error: message }, status);
}
