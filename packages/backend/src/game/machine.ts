import lodash from "lodash";
import { Options } from "selenium-webdriver/firefox.js";
import { Browser, Builder, WebDriver } from "selenium-webdriver";
import { assign, createMachine } from "xstate";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";
import { start } from "../game/browser/index.js";

export const gameMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBd0AncgqAYguvIH0p1UwBtABgF1EoAA4B7WLloj8gkAA9EARgCsADhI8VSgJwAWHgGZ9CgOw9jO-QBoQAT0QAmHvZL2dW9zx1L9OhVoBs+gC+QdZoWHiEpAA2IugQdPSx8ZC8AkggouKS0hnyCL48JP5K-vbmWgoqvv4K-tZ2CI7Oru5ant6+AcGhIOE4BMQkQtHoNomw6ABu3PwyWRK4UjL5gTokxirt7sZKOrX+Wg2KPiRu7iqbPCZuKiohYRgDUcOj4-gMVHCUNGnzYotlnlEIUSAEeFptPoIZstJdjggVAozm0tEYeEoNGjjA8+k9IkNJlMJtNUnMMgscitEGsNlsIVpdvs6kdbIgVPowaj0Zitvocbj8CIIHAZP0CUR-tklrlQPkALT1NkIRXqHjqjWajUCx4RQakJg0OhSwGyuQg+wIy4kVSGexKB1efTlLS48X6kjJBIfE1U4EIaGchQmRyldrGHxKBHNDbndpOrqBN34j0jMbGikAv1yxBKexBiH6OGVEysxrtdQc50OvbeF3JvUvIkZ4RZmXUhDmZEYnTGewldxGTQIrTOW3Vx114yukJBIA */
  predictableActionArguments: true,
  schema: {
    events: {} as
      | { type: "start_game" }
      | { type: "save" }
      | { type: "restart" }
      | { type: "saved" }
      | { type: "loaded" }
      | { type: "screenshot" }
      | { type: "command" },
    context: {} as { driver: WebDriver | undefined },
  },
  context: {
    driver: undefined,
  },
  initial: "is_starting",
  states: {
    is_starting: {
      invoke: {
        src: async () => {
          const options = new Options();

          lodash.forOwn(getConfig().game.browser.preferences, (value, key) => {
            options.setPreference(key, value);
          });

          const driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
          logger.info("fullscreening");
          await driver.manage().window().fullscreen();
          await start(driver);
          return driver;
        },
        onDone: {
          target: "loading",
          actions: assign({ driver: (_context, event) => event.data }),
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
    is_error: {
      type: "final",
    },
    loading: {
      on: {
        loaded: {
          target: "playing",
        },
      },
    },
    playing: {
      on: {
        save: {
          target: "saving",
        },
        restart: {
          target: "is_starting",
        },
      },
    },
    saving: {
      on: {
        saved: {
          target: "playing",
        },
      },
    },
  },
});
