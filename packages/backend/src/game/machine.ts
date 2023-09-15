import lodash from "lodash";
import { Options } from "selenium-webdriver/firefox.js";
import { Browser, Builder, By, WebDriver, until } from "selenium-webdriver";
import { assign, createMachine } from "xstate";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";
import { exportSave, importSave, setupGame } from "./browser/game.js";

export const gameMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOl1gH1YAXdAJ2oKgGIIB7Qs-ANzYGswJNFjyFS5KrQZMEBXpnSMOAbQAMAXTXrEoAA5tYuJfh0gAHogC0ARgCcJAKwBma9YAcb2wDYALG59OAOwOADQgAJ6IXtYktoFeDtHWAEy2PoG2tk4AvtlhwjgExGSUNPSM+CxgdHRsdCS6ADaKAGZ1qEIYhWIlkuUycmwKxlpapvqGxqYWCDb2zq4e3n4BwWGRs9ZOXiTpCV5OboGqDsmqqoG5+V2ixbio+tKVrByCgwKdIkXiD3UVULIeENFLgVBoxkgQBMjKCTJCZk5VDtMslkk4nMl4ttAsl1ohMiQzi40V5UulMjk8iACrcfo9-sxqrV6k1Wu1Pt07r8ngDBsNYaMNOMDDCONNEIjkbZUejMQcvDi8QgHCRAj5MrY3KS0hkspTrl8enQwI02OgIC9OO9BDTviRjabzYD5CCwZohZDoVN4RKkbFpWiMViFbiIogfL4SFtkm5XCkdRSrtSbnaHWaLUy6g1mtQ2nQOrajSb087gSNwR69CLvaAZqSVb4kcdAsHFWGEMkHDEfKkvFr4+SsknC8UygwKKzwkxLW8gR8R6Qx9QJ80p5VS-y3RCq5NYeLNvMXO5PL5-EFQu2nD4fCQPDG42Tdfrk4bR1Jl5Pp5mWTm8wWUz0S4ruga68kCm74IK2ietWe4+gejhHksp6rBeGwOG4TgkIc96uI+mTDgBxSfs8YBmPS25QrBYrwckN7WBkgSyq2x5KtYDgqj23j9vhQ5Ugu2YgdOxpLpRXpwbWvpSjKQbym2GxyrsSJ0VqvHPgJJEsLAmDGmA+CwNgbDUGJ1FwpJCDWNehLKbYDgtnJoYKaiSmkn42qDupRGkJpzCYGwqAYPgEAmbuNHmZZ9gXExninA5bFMbEyluWphGvqQZH0tO7BWnONpeSQGV-AM4GupBFbQTuopmeYVh2Ihiwnis55KkSsS9jxCZ8QanLpeRRWkTUWasrm7ICYVPIbqVUHCqF1UzHM9XHssZ5rO2nbdu10QpUm+BsBAcCmAuM1Vfulh0TsDhZKtGxnWisTxIknapT1vRLkwx01jVB5uI4WR9o1K1oeGOxEik2zbd1tK9N+H0SV9gQeLethNlFcVrQqjiPclnXPVD9yZZUsNhV9lnJG1cTMWjGxeKouwLCSEMvi9abmkTc3AzEdmxs2raOYgdH2MjrmqZ1nlpSQQGaWzp12D9l3Ne2HH2Giqzgzj-H5VLMGzfu7H2Mc2p2bzLXBIlwvuU+uN2uN-zS-Bcxy39yFNdd-OYoSsYqRbiYa+LhAAO4AARlNQYCB9YdvmTYbhk0SqhpH4dHJKxivnKqV5BGrHm5LkQA */
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
