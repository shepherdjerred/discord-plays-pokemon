import lodash from "lodash";
import { Options } from "selenium-webdriver/firefox.js";
import { Browser, Builder, By, WebDriver, until } from "selenium-webdriver";
import { assign, createMachine } from "xstate";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";
import { exportSave, importSave, setupGame } from "./browser/game.js";

export const gameMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOl1gH1YAXdAJ2oKgGIIB7Qs-ANzYGswJNFjyFS5KrQZMEBXpnSMOAbQAMAXTXrEoAA5tYuJfh0gAHogC0ARgBMAFhL37ANlUBWd6tXWA7PYBOBwAaEABPRAAOR1sXd3tba0iAZl8fAKSAX0zQ4RwCYjJKGnpGfBYwOjo2OhJdABtFADMa1CEMfLEiyVKZOTYFYy0tU31DY1MLBBsHJ1cPLx9-IPtQiOnra0ck3zTk6xdbAMjVSNts3I7RQtxUfWly1g5BfoF2kQLxO5qyqFkeAaKXAqDQjJAgMZGYEmcFTWyqWwkVS7ZIBHy2XwuezuZJrRB2axODLHezJVLpLI5EB5a5fe6-ZiVaq1BrNVrvTo3b4PP79QbQ4YaUYGKEcSaIeGI5G+VHozHY3HhCWRJHJSKRdwBMlpawZTEXalXT4kOhgepsdAQJ6cV6CGnG03my3-eRAkGaIXgyETWEShFIlFouzynF4hD2dVORIuXxJcm685U+1dR0Wq1Mmp1RrUFp0NrJwqp518t34QXaL0in2gKbueEkXy2dxnTEYrF1sMY9wNpLxFwpHVBA0F0glBgUVlhJjWl4At4jkhj6gTxpT8ouwFDUGevRV6HijazZxuTzePyBEJKhDJFwBEh+A6xgfpROXD5dJcr9BripVTOsnN2QXT9Jz6AF+XdMFd3GfdfUPRxjwWM9lkvdY3F8EgY0fONB1fQ130KUDHjAMx6SgiE9zFODLDOBtkncTZfC8c8VjDPwMKfPtn11Sk305UgiJYIsIHI71YJrP0pUDOV20VdYjjvW8GNULV4yHJMjS6QTmFgTBTTAfBYGwNhqFEyiYQk68VUiDJsViNs7LiTtnEwgJlNUwdePw-is2-adMDYVAMHwESdwomCqMs0kG0OPtUhDWJ3DYgJtjc6wVO1ClImHTTChI+lp3YG05ztXLSHyn4wNdLcPQraDRQs8wrDsBD5lPJYL1WK9bFsFVEg1VxuIybKNII8rSMq4i-xZbNc3zMqSAqnkNwgsttzq8KGoPGZWpPRYWNQiUmJ7Ab+zUxMqXwNgIDgUwR2FCLGqmSx6MJLwNXag6uvWSx4UJftdlUfZDmOU48IXCQlyYB6tuo5IgZId7PH2lDvsQfsiV1aJMp4ka+NpboMzoGHqyahAzpIAImJbQ4Es7DISGidycYydwcrGshuV+EnxLJtUkS2GyZLsgIw1o-wsdJNSvIXYSecivn3BcTCXDJNsHNDbr-HvNKMvO9mfJA1docrR7tvh5JEdOZHkM6sNm0tutklsZIpdwg2CcE+WnsQTwSFRLY61p9tErDeHVB15n9dGnylu503Ycsl6EaRz7Uc7BjEZ1PXPJG7IgA */
  predictableActionArguments: true,
  schema: {
    events: {} as
      | { type: "start_game" }
      | { type: "export" }
      | { type: "reload" }
      | { type: "import" }
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
          await setupGame(driver);
          return driver;
        },
        onDone: {
          target: "importing",
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
    importing: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await importSave(driver);
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "reload",
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },

    reload: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await driver.navigate().refresh();
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "start_playing",
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },

    start_playing: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            logger.info("waiting for play now button");
            const playNowButton = await driver.wait(until.elementLocated(By.xpath('//a[text()="Play Now"]')));
            logger.info("clicking play now button");
            await playNowButton.click();
            logger.info("clicked button");
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "playing",
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
    playing: {
      on: {
        export: {
          target: "exporting",
        },
        reload: {
          target: "reload",
        },
        screenshot: {
          target: "playing",
        },
        command: {
          target: "playing",
        },
      },
    },
    exporting: {
      invoke: {
        src: async ({ driver }, _event) => {
          if (driver) {
            await exportSave(driver);
          } else {
            throw Error("unreachable state");
          }
        },
        onDone: {
          target: "playing",
        },
        onError: {
          target: "playing",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
  },
});
