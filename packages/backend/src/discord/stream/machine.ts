import { Builder, Browser, WebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/firefox.js";
import { assign, createMachine } from "xstate";
import lodash from "lodash";
import { getConfig } from "../../config/index.js";
import { logger } from "../../logger.js";
import { shareScreen } from "./stream.js";
import { joinVoiceChat, disconnect } from "./voice.js";
import { isLoggedIn, login } from "./login.js";
import { updateSettings } from "./settings.js";
import { navigateToTextChannel } from "./index.js";
import { onError } from "../../util.js";

export const streamMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOl1gH1YAXdAJ2oKgGIIB7Qs-ANzYGswJNFjyFS5KrQZMEBXpnSMOAbQAMAXTXrEoAA5tYuJfh0gAHogC0ARgBs1kgHYAzABZrAVg93VATgBMAByOrgA0IACeiNbWjiSuvh6qgUkpjo4etrYAvtnhwjgExGSUNPSM+CxgdHRsdCS6ADaKAGZ1qEIYhWIlkuUycmwKxlpapvqGxqYWCDb2Tm6e3rZ+QSHhUbPOgSS+gdaugdsuqq7pth65+V2ixRKNbFBQTBQErByCgwKdIkXilA8ni8CLIeENFLgVBoxkgQBMjJCTLCZnZ-CQVtZ9tZfL5VBdYhtEEE0bY9v5-LF3BTnHYriACrd-hRAc9Kq98MxqrV6k1Wu0ft07gDHqyoOzQfIIVDNBpxgYERxptFbCTVJiYji8d5HISENZVM4SP5XElHEckh5yYc6Qy-r0WZB2e9OF9BLaevcRY6QYNhojRrLYfCpsjEIdDc5-Hi1aoDVljc5da4guiQo49qp0o4LoEbTc7Z6nt6OVy6g1mtQ2nQOu6hcyvRBxb6pfgA9og-KQ6AZuGSJHo-q4yrXInIkSTfFHHYzslXLZc3l6fmPZQ6GB0BAIswygxJGv0KgYXpO4ilQgMjsKbi5+l-CqYkm3PFjYEoysVlGjnnfj0dxUxTQ+6oM6nxgt8takH+LyAeuqASuCIzQoGx6TKeoZ6skaJeEk1jOAEyZqrYSYBCQni4QEzhJLY2aXIuEEkFBbIwQenI1GWvKVvy9GMQB1BAfBfrSkecInoq6H6q+JDYWqeHGlGdi6nhOykq+nj7IERwZN+gqkGA+AQNBfGwSBXC8OBy7FHpBlMUZB4CS2bZyqhYndmGRx9m+MZDgmuqZL46L+OmQQJPqloLtcP6WfphlAax3Llny1YCoyJBWTFsH2YhMrtihCpIq5CC9v2GKxs48Yjkm2akSEgSnKceHWP4zjONpKXMagTCcvpe6wcJwZoQVElYV4Mn4fJRFjgg85xM46S+LNLh3uSOR0RZkG2R1lTblI1A9QefWifl5jRP4mSkWq6azbEU6ZkmE6BbYZWuCawSBMmuSLvgbAQHApgQU5eVnpYs2GumWQeAkHghCDuo2He8T7OGwTOKc5ytQWpQ7UwANdsdWynU4vjg5D0MuLD8OnQk5J+Bpfgoy1q2RUyLLAkd-UuXjNjxCsU7bIcb6NRNmwxB4uxTrYc6PR4bivq46MrvWRaNgQOMDXjNL+adtUZNOtWHLqWukXs2K1Zm81E7REU6b0pZ0KrHMoneDj2CEHi+CL+r65NlhogEaneMadgeCkb3y3W+6bvbR0zBLhqeBcXgUvqGSjpsI6uLsxrpiaj3UZ4Yfrf0NlAVHZ7u4a7gjoEKp4Y4qinUmMTPoccaUcmloF6l0XF7BpfoTSGda-qjWZp4te+WcAVBcmgSJO4nftdjHbOdHJ3UU45LBIk0sHK+vmxk42bbHhSRBPOH3ZEAA */
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

          return await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
        },
        onError,
        onDone: {
          target: "is_logging_in",
          actions: assign({ driver: (_context, event) => event.data }),
        },
      },
      states: {},
    },
    is_logging_in: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            if (await isLoggedIn(driver)) {
              logger.info("already logged in");
            } else {
              logger.info("logged in");
              await login(driver);
            }
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "is_logged_in",
        },
        onError,
      },
    },
    is_logged_in: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await updateSettings(driver);
            await navigateToTextChannel(driver);
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "is_ready",
        },
        onError,
      },
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
        onError,
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
        onError,
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
