import { z } from "zod";

export type ScreenshotRequest = z.infer<typeof ScreenshotRequestSchema>;
export const ScreenshotRequestSchema = z.strictObject({ kind: z.literal("screenshot") });

export type ScreenshotResponse = z.infer<typeof ScreenshotRequestSchema>;
export const ScreenshotResponseSchema = z.strictObject({ 
  kind: z.literal("screenshot"), 
  screenshot: z.string(),
});
