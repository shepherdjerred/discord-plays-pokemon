import { Builder, Browser, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/firefox.js";
import { assign, createMachine } from "xstate";
import { disconnect, joinVoiceChat, setupDiscord, shareScreen } from "../browser/discord.js";
import { exportSave } from "../browser/game.js";
import lodash from "lodash";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";

export const streamMachine = createMachine({
  predictableActionArguments: true,
  schema: {
    events: {} as { type: "initialize" } | { type: "start_stream" } | { type: "end_stream" },
    context: {} as { driver: WebDriver | undefined },
  },
  context: {
    driver: undefined,
  },
  initial: "initial",
  states: {
    initial: {
      on: {
        initialize: {
          target: "starting",
        },
      },
    },
    starting: {
      invoke: {
        src: async (_context, _event) => {
          const options = new Options();

          lodash.forOwn(getConfig().game.browser.preferences, (value, key) => {
            options.setPreference(key, value);
          });

          const driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
          await setupDiscord(driver);
          return driver;
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
        onDone: {
          target: "is_ready",
          actions: assign({ driver: (_context, event) => event.data }),
        },
      },
      states: {},
    },
    is_error: {
      type: "final",
    },
    is_ready: {
      on: {
        start_stream: {
          target: "starting_stream",
        },
      },
    },
    starting_stream: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await joinVoiceChat(driver);
            return await shareScreen(driver);
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "streaming",
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
    ending_stream: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await exportSave(driver);
            return await disconnect(driver);
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "is_ready",
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
    streaming: {
      on: {
        end_stream: {
          target: "ending_stream",
        },
        start_stream: {
          target: "streaming",
        },
      },
    },
  },
});
