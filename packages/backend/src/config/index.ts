import { ztoml } from "@d6v/zconf";
import { ConfigSchema } from "./schema.js";
import { existsSync } from "fs";
import { resolve } from "path";
import { exit } from "process";
import { addErrorLinks } from "../util.js";
import { ZodError } from "zod";
import { logger } from "../logger.js";

const path = resolve("config.toml");

if (!existsSync(path)) {
  logger.error(
    addErrorLinks(
      `The config file does not exist at expected path, which is ${path}\nTo resolve this error, copy config.example.toml to ${path}\nDon't forget to edit config.toml after copying it!`,
    ),
  );
  exit(1);
}

try {
  await ztoml(ConfigSchema, path);
} catch (e) {
  if (e instanceof Error) {
    if (e.name === "SyntaxError") {
      logger.error(
        `Your configuration at ${path} _is not_ valid TOML.\nCorrect your config.toml to continue\nA TOML validator may be useful, such as an IDE plugin, or https://www.toml-lint.com/\n`,
      );
      exit(1);
    }
    if (e.name === "ZodError") {
      const errors = JSON.parse(e.message) as ZodError[];
      logger.error(
        `Your configuration at ${path} _is_ valid TOML, but it is not a valid configuration for this application.\nThe following problems were found:\n\n`,
        errors,
        addErrorLinks(""),
      );
      exit(1);
    }
  } else {
    throw new Error(`Your configuration is invalid.`, { cause: e });
  }
}

export const config = await ztoml(ConfigSchema, path);
