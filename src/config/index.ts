import { ztoml } from "@d6v/zconf";
import { ConfigSchema } from "./schema.js";

export const config = await ztoml(ConfigSchema, "config.toml");
