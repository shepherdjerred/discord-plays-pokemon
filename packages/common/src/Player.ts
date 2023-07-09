import { z } from "zod";

export type Player = z.infer<typeof PlayerSchema>;
export const PlayerSchema = z.object({
  discordId: z.string(),
  discordUsername: z.string(),
});
