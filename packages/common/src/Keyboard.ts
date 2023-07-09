import { z } from "zod";

export type KeyboardKey = z.infer<typeof KeyboardKeySchema>;
export const KeyboardKeySchema = z.object({
  display: z.string(),
  key: z.string(),
  api: z.string(),
});
