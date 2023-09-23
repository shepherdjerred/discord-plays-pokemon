import { ztomlSync } from "@d6v/zconf";
import { ConfigSchema } from "./schema.js";
import { resolve } from "path";
import { addErrorLinks, assertPathExists } from "../util.js";
import { generateErrorMessage } from "zod-error";
import { ZodError } from "zod";

export function getConfig(file: string = "config.toml") {
  const path = resolve(file);

  assertPathExists(path, "config file");

  try {
    ztomlSync(ConfigSchema, path);
  } catch (e) {
    if (e instanceof Error) {
      if (e.name === "SyntaxError") {
        throw new Error(
          `Your configuration at ${path} _is not_ valid TOML.\nCorrect your config to continue\nA TOML validator may be useful, such as an IDE plugin, or https://www.toml-lint.com/\n`,
          { cause: e },
        );
      }
      if (e instanceof ZodError) {
        throw new Error(
          addErrorLinks(
            `Your configuration at ${path} _is_ valid TOML, but it is not a valid configuration for this application.\n\n${generateErrorMessage(
              e.issues,
              {
                delimiter: {
                  error: "\n",
                },
              },
            )}`,
          ),
          { cause: e },
        );
      }
    } else {
      throw new Error(`Your configuration is invalid.`, { cause: e });
    }
  }
  return ztomlSync(ConfigSchema, path);
}
