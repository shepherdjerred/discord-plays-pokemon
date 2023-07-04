import { z } from "zod";

export type Config = z.infer<typeof ConfigSchema>;
export const ConfigSchema = z.object({
  server_id: z
    .string()
    .regex(/[0-9]*/, "IDs must only have numeric characters")
    .min(1),
  bot: z.object({
    discord_token: z.string().min(1),
    application_id: z
      .string()
      .regex(/[0-9]*/, "IDs must only have numeric characters")
      .min(1),
    commands: z.object({
      enabled: z.boolean(),
    }),
    notifications: z.object({
      channel_id: z
        .string()
        .regex(/[0-9]*/, "IDs must only have numeric characters")
        .min(1),
      enabled: z.boolean(),
    }),
  }),
  stream: z.object({
    enabled: z.boolean(),
    channel_id: z
      .string()
      .regex(/[0-9]*/, "IDs must only have numeric characters")
      .min(1),
    minimum_watchers: z.number().nonnegative(),
    require_watching: z.boolean(),
    userbot: z.object({
      id: z
        .string()
        .regex(/[0-9]*/, "IDs must only have numeric characters")
        .min(1),
      username: z.string().min(1),
      password: z.string().min(1),
    }),
  }),
  game: z.object({
    enabled: z.boolean(),
    commands: z.object({
      enabled: z.boolean(),
      channel_id: z
        .string()
        .regex(/[0-9]*/, "IDs must only have numeric characters")
        .min(1),
      max_actions_per_command: z.number().nonnegative(),
      max_quantity_per_action: z.number().nonnegative(),
      key_press_duration_in_milliseconds: z.number().nonnegative(),
      delay_between_actions_in_milliseconds: z.number().nonnegative(),
      burst: z.object({
        duration_in_milliseconds: z.number().nonnegative(),
        delay_in_milliseconds: z.number().nonnegative(),
        quantity: z.number().nonnegative(),
      }),
      chord: z.object({
        duration_in_milliseconds: z.number().nonnegative(),
        max_commands: z.number().nonnegative(),
        max_total: z.number().nonnegative(),
        delay: z.number().nonnegative(),
      }),
      hold: z.object({
        duration_in_milliseconds: z.number().nonnegative(),
      }),
    }),
  }),
  web: z.object({
    port: z.number(),
    assets: z.string(),
    api: z.object({
      enabled: z.boolean(),
    }),
  }),
});
