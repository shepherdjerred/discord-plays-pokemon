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

export const streamMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QGUAuAnMBDAtgOgEtYB9WVLdVAgOygGIIB7asQ6gN0YGtW1NdCJMhSq0ENTgGMsVZgG0ADAF1FSxKAAOjWAVnV1IAB6IATAA4ALHgCcAdgUnbANgXWFzs7YA0IAJ6mzBTwAZgUwgEYAVk8zYJNw2wBfRJ8+bHwiYgAbRigoGihiGgZmVgluXgx0wWzc-Noi6nEORmk9VVUDLR09A2MEaNs8SISE6wszJwsLazMffwRQ4LxHJ0jrSItokymklJA0gUycvMhGkpY2Th48Q4ySE5gIRuapGQJ5ZU6kEG7dD-0P36bjMK2C6wstgsUQsLgs80QSxWznWm22u2SqSqRxI-AgvjowkopGxOG+mm0-2YfUQ4QSy3CwQswXBsycJniCIQJnGwx2kXs61skRMwXCmIOpLwRNEhTI-BwFzKLRud2l5EoBRJCterXenxUyi6lN6QNpMyGkIc9gULKhTK5PKceAca0sZlFkUiU0iErVYGoEC18vSSquFVuUoDQYaIdwuraAI6Rp+f1NoGBClBnvGUJhcMdjLwTmscRGwUs1g2Cl9+zVcZwBTo0e16XJvxNAJpCHCFrwVscYTtzPhfkQ1hMNmZ5nCHuZNfWfqlDabMtbuHbaa7Zp7U3CLtG5jdCl7czH3Isk9dkO9CS9qOS+2ojAgcAMd2NPW3GcQzn7mzWNYJgrKETC5SJ+2nOcWVLOIFCcJcFRqGUCk-KlAR-HsTCsLZYW9TZYk8S9HVsUFbBRMw70iBxbUQ6pjjqLUaDQ9MjEQS9llwoDPFsWcnCcEiyJRfjwhLUTez2LEkIY05nmY1NO2pHcoSselL3MeDwjsMDz0cITAKcUTrHEyE6JxYgwHQdBGHQFjvzYns4hCWwdiiFzvRvATzwrKxVm2BJL29awzPuYg8QWCkvyUzDwhrUF3FnWcQTMEYzwWHkINdSJgnGExohrCwQvVERg1JOzoocxlzBCJ1RWw+JnG8XTeL5NZ7yZLYxUkyUkOjUqFXKjCHNsHK8DUjlAkM7SuXpZE1iZAUPXcPKipXWhBu7USRWLCstOZWxxhrR07Fa7Lcvyr1CsfIA */
    id: "Stream",
    description: "Manages the lifecycle of a Discord stream with the Chrome browser",
    predictableActionArguments: true,
    strict: true,
    tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
    schema: {
      events: {} as { type: "start_stream" } | { type: "end_stream" },
      context: {} as { driver: WebDriver | undefined },
      services: {} as {
        start: {
          data: WebDriver;
        };
      },
    },
    context: {
      driver: undefined,
    },
    initial: "is_starting",
    states: {
      is_starting: {
        invoke: {
          src: "start",
          onError: {
            target: "is_error",
            actions: logger.error,
          },
          onDone: {
            target: "is_logging_in",
            actions: "setDriver",
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
          onError: {
            target: "is_error",
            actions: logger.error,
          },
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
          onError: {
            target: "is_error",
            actions: logger.error,
          },
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
          onError: {
            target: "is_error",
            actions: logger.error,
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
            actions: logger.error,
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
  },
  {
    actions: {
      setDriver: (_content, event) => assign({ driver: event.data }),
    },
    services: {
      start: async () => {
        const options = new Options();

        lodash.forOwn(getConfig().game.browser.preferences, (value, key) => {
          options.setPreference(key, value);
        });

        return await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
      },
    },
  },
);
