import { z } from "zod";

export type Level = z.infer<typeof LevelSchema>;
export const LevelSchema = z.enum(["Info", "Warning", "Error", "Success"]);

export type Notification = z.infer<typeof NotificationSchema>;
export const NotificationSchema = z.object({
  id: z.string(),
  level: LevelSchema,
  title: z.string(),
  message: z.string(),
});
