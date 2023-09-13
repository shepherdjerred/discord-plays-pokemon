import { Builder, Browser, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/firefox.js";
import { assign, createMachine } from "xstate";
import { disconnect, joinVoiceChat, setupDiscord, shareScreen } from "./discord.js";
import lodash from "lodash";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";

export const streamMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgNwBdd0AbAYnKttwC8wBtABgF1FQAHAPaxKuQfj4gAHogCMAZgCsJWZ1mKAbAHYNAJkWcAHABZOxgDQgAnnNlaSu3RsUvHxrbMOKtAXx+W0LDxCUlgKdAAnKnwoOghxMDJ8ADdBAGtEwJwCYhIwyOioBAJUzHQqcS5uKskhEQqJJGlEY3ldBwNOTgBOTicTNUsbBF15ThItJ01DQ3ktd0V3PwCMbJC88KiCWLAIiMEIkn4acoAzA9QSLODc-K2Y4pTBMoaqmqa60XFJGQRW9v0XR6fQ0A1kQ0QhlkJE6XX03Tmxm6um6yxA1xypFwsAA+hEwOgIFY6HcKDiwvj0Kh3gJhF9GqBflpOBoSPJDLpDJxFE5ZOpOFoISNFN0SMZFPI+V5dD05miMetSdtyRRKag4gkkqkMldVjdQptCiq1Y9SuUxPg3jxanSGj85JwxhNPFp2Rp3d1erohTz2t0JVLujNZsj5XrMRsCsqKQT1bt9odjmcLrqghGlTFjbHTc9zZUeDSQJ87U1fqonR5DK7DO6NJ6+kLHPIJlNnDNPdpXWG0+swPgINHVbGNYQtelMuHe-3ByaSrnXgXrR9bRb7X82h0gV7QaZwdZEG1jCotN064sUd1ZLpjN21rk+wPMzGqXR4wcjicKOcIpcFffp0+Q5UjmLwWlavDLvUq6li0G6Al025gkK7LjJMzguHWTgyr4-jopOtxAag2yvv2WZUoWxbQYyDoVi6boel6PrMmKAZ2PI7IGBo8i3vqGxqsRpJkdSS60lB3wwQgfLzA4zh6Gojqep4QruKyApQqodgeLISxovgggQHAkh-kQNpiQyzQIAAtBoQrWTxEaMNQNCmfSa7GN6+6SXYLbOO4fT6HWCL2YqhrbC5JbUcKhgqFWBjsfIxgut0QrdEejjOMyQY1olkrBbk2I4m+EThVRFlSaKWhQqMdbMglLKNsYR7ipK7KOIoHIsooeVYrilJEiV4mRSK0JtI6V5aMyoIio2IokP6kqtONrWorhxmRvcUBCQN5m-DW0LeOpVbqFyiWNvIrLNQo7kmF43QeN1JAPjOsbbWu+jNi6cXsYlVYzMhjhsmY7qaDK6jug9z5ETEr0SVKygzNosj+t4iXaD6kowpVV4aKYhgIv6fh+EAA */
  predictableActionArguments: true,
  schema: {
    events: {} as { type: "start_stream" } | { type: "end_stream" },
    context: {} as { driver: WebDriver | undefined },
  },
  context: {
    driver: undefined,
  },
  initial: "starting",
  states: {
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
