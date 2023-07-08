import { z } from "zod";

export type Connection = z.infer<typeof ConnectionSchema>;
export const ConnectionSchema = z.object({
  status: z.union([
    z.literal("initial"),
    z.literal("connecting"),
    z.literal("connected"),
    z.literal("disconnected"),
    z.literal("error"),
  ]),
  latency: z.number().optional(),
});
