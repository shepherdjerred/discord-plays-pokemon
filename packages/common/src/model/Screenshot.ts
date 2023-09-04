import { z } from "zod";

export type ScreenshotRequest = z.infer<typeof ScreenshotRequestSchema>;
export const ScreenshotRequestSchema = z.strictObject({ kind: z.literal("screenshot") });
