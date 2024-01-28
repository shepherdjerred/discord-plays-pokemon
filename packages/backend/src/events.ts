import { z } from "zod";

export const DiscordSourceSchema = z.strictObject({
  kind: z.literal("discord"),
});

export const WebsocketSourceSchema = z.strictObject({
  kind: z.literal("websocket"),
});

export type Source = z.infer<typeof SourceSchema>;
export const SourceSchema = z.discriminatedUnion("kind", [DiscordSourceSchema, WebsocketSourceSchema]);

export type ScreenshotEvent = z.infer<typeof ScreenshotEventSchema>;
export const ScreenshotEventSchema = z.strictObject({
  kind: z.literal("screenshot"),
  source: SourceSchema,
});

export type CommandEvent = z.infer<typeof CommandEventSchema>;
export const CommandEventSchema = z.strictObject({
  kind: z.literal("command"),
  source: SourceSchema,
});

export type Event = z.infer<typeof EventSchema>;
export const EventSchema = z.discriminatedUnion("kind", [ScreenshotEventSchema]);
