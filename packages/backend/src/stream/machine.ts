import { Builder, Browser, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/firefox.js";
import { assign, createMachine } from "xstate";
import { disconnect, joinVoiceChat, setupDiscord, shareScreen } from "./discord.js";
import lodash from "lodash";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";

export const streamMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBd0AncgqAYggHtCSCA3JgazBLSzyFSFarXxQEHJpnS0WAbQAMAXSXLEoAA5NYuOfg0gAHogBMigKwkAnAA4AbAEYA7I-vWAzI4As1xwBoQAE8zD0USZ1NHD19Fb28PD2cPAF8UwP4cAmIySho6ejAqKiYqEk0AG1kAM1LUPgwsoVzROkl8Thl9NTVDbV19QxMEcys7J1d3L18A4MRbRxJfb2cLb1sLa2cHNbSMxsEc3FgAfSowdAgg+hEaE4pz9FRepBB+vVwWIcR18MdHWzWawWZzuJyKayBEIjTZLFbWRSmaxOBFbPYgTKHYR5MRQe7kR6oRgsXhSHgNATZbGtcT4wntTqyT74HoqPo6D5fV7DWxxJZrIGmUy2bwWeyWKGICxCmzwjwWRyKRTbVLpDEHKktfK0h4XIlFEplSo1OoUpo5W64ul6hnSJkKFQvLQcwbc+Z80W+axCkViiVzEamDwRKJeWzCuymez2VX7SnNMD4CB0a1PYmsMm8TGaxPJnUEm1SLrM1nqV7vV2gYajGwOFxuTw+PyShAeUzeEgueKrBHxFwWdHZhNJlO6tMG0rlKrkWpUepDnK50cFp624sO1Rs8su5nfEaWWsTBvTZsBjy8kM+ZXRCxi5zOQca5pj1AFXOp55b50DXduhC8jtPUFYVRXFCwWxBcJu2sbwIQBCxbGSR94wtFdX3EG4cQ-J03h3Lkq0QGDbBIJUAUQxQ2x8f4WxWewSOSCitnsbxHFMVw0jVfAmAgOBDAXIh2R-fDjEQABaKJ6JjKNHD8BDbHlFtRLopVpSFHw2NWOJkPNaltSgQTOQMP8oxsIN7GSXkRX+czbBbGCSDUrwfVccNPG0rE2FOCcqAMysRIQYFgwVZxuwsJVgTYlt20A+ElXk5wgTWex3M1Y4zguK5fN-AjW3sKxLGY28ogsDwbKi2EYIS8x3ASNSUufHFl0JLLhOGGMrGmRJPG8PLPFMKLSrhbYFnsYVEVcUx6sXEd82a7chKMnKTO9UqLMUKy3HAs8ZSRSqEn+RJ7BFKbsUJOgWsW-zgWsEhRrCJUEtKsqAxKxYQSRPsQuY0qOJSIA */
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
