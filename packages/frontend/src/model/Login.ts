import { z } from "zod";
import { PlayerSchema } from "./Player";

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export const LoginRequestSchema = z.object({
  token: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export const LoginResponseSchema = z.object({
  player: PlayerSchema,
});
