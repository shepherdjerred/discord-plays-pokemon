import { z } from "zod";
import { PlayerSchema } from "./Player.js";

export type Status = z.infer<typeof StatusSchema>;
export const StatusSchema = z.object({
  playerList: z.array(PlayerSchema),
});
