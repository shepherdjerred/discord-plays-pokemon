import { Builder, Browser, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/firefox.js";
import { assign, createMachine } from "xstate";
import { disconnect, joinVoiceChat, setupDiscord, shareScreen } from "./discord.js";
import lodash from "lodash";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";

export const streamMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOl1gH1YAXdAJ2oKgGIIB7Qs-ANzYGswJNFjyFS5KrQZMEBXpnSMOAbQAMAXTXrEoAA5tYuJfh0gAHogBMlgIwlVANksAWAJwBWSwHYAzDfcONpYANCAAnlY+qiRelg4BNq6ulgAcKV4pAL6ZocI4BMRklDT0jPgsYHR0bHQkugA2igBmNahCGPliRZKlMnJsCsZaWqb6hsamFgjWdo4uHt5+CSHhiCl2bkmuTinODn7J2bkdooUSdGDoEGHMJQySF+ioI0ggY0a4HJOIbu4kie4-DZdqo9ikPKEItN3K4SM5ATYogFnBlQUcQHlTqQ7mUoA9LqhWBxBP0BO0RAVsVJcfinrIeANFJ98MMNKMDB8vq8putYQjbKoUu54YEHJDEJ5LCQPH5bK5fOlBejMZSSDimLTCZVqrUGs1WuTOoV1eVNfT5EyVBoXnoORNuWtEiR+TZBcKEmLVtNLD4YnEAqkUpZ5a4fJZlSdVWB8BANTRHoT2JxSYIVV1o7HTfGCebGUNrWzXu97aApjN7E5fot-IEVlCw85-l5th5gR4g74IxT0zG49QE8xtTU6o1qC06G004UM32E7nBszWdoi3bmd9vbNKwtfDWguKED4UtFYvE9sG-OtwzkMZGutmnkxBzHNTa3quuaXHXzZa6hSKbJ6ULuF40TwlErhBLEXhuA4XZGlSCaPjiL6Fra4xrg6CDbL6qioqGGSeDYez7iiDj2BkNjAgEnheIC2TXvgbAQHAphTkQ7LoR+5iIAAtIBvGwdebHdCaUAcZyJiYc4daIK4jbWPEDiqO46yXs4WRCbeZyUEOdDiSW3FYQ4KTOvh+zpLYF77i4jZgUE2xCo4qg+IJxzdtpFCPNc+kYZ+B5Hv8YbNtBJ5ES41kwtKCJIg4KJHs4cFYmq1KzgSPlcVM8TRD4rjKRkLjQblMnTC5cLRWGPjuMpKKJVGvZZv2aUrpxkl+dJ+5hlKUR7Ns3gZH4PgJZp7kIQSTDpa1hnyo2DhJABKRKZYKlJPuCLOnhzgokk7jAfRmRAA */
  predictableActionArguments: true,
  schema: {
    events: {} as { type: "start_stream" } | { type: "end_stream" },
    context: {} as { driver: WebDriver | undefined },
  },
  context: {
    driver: undefined,
  },
  initial: "is_starting",
  states: {
    is_starting: {
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
