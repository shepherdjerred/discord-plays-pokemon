import lodash from "lodash";
import { Options } from "selenium-webdriver/firefox.js";
import { Browser, Builder, By, WebDriver, until } from "selenium-webdriver";
import { assign, createMachine } from "xstate";
import { getConfig } from "../config/index.js";
import { logger } from "../logger.js";
import { exportSave, importSave, setupGame } from "./browser/game.js";

export const gameMachine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlgBd0AncgqAYggHtCSCA3JgazBLSzyFSFarXxQEHJpnS0WAbQAMAXSXLEoAA5NYuOfg0gAHogCMADgAsJUwHYAnLcuLz5gEwA2RQGZTlgDQgAJ6IHrYArCS2Draebt6eHpaWAL4pgfw4BMRklDR09GBUVExUJJoANrIAZqWofBhZQrmidJL4nDL6amqG2rr6hiYIFtZ2js6unj5+gSEItt4k3uYe4abeXmvhbuamaRmNgjm4qNr54owsvFI8DQLZpKfnYhJSXbgKKr1IIP16nwMv2G4UUHiiiWcdksOx2c0Q4VsphIHg2YOSSWcllsBxAmWOTzOpVehWKpXKVXItSo9XxjzYRIubw60lkgJ6Kj6OgBLCGCLBEI8SUU0NhbnhCA89kUJEUbkcoNsimi4W8qXSeKO9KoYAqTHQECurFuvDpzR1eoN7U6bK+qk5v3+g2BiHcSzcoJcjgirjhwUQyWRGJWlns4XDqzcuLNOQt+sNRRKZUqNTq9yasd18etrO63wdWm5ztAwzdJA9ii9Kt94v9CHC2JI5hmlil9nlCXVhwezRENAA+imggVmMaWXcY8I8uRB1Vh+Icx87T9CwNAXyEOZvDL7H4NqsIiKAnXvPYlvZW5t7OYnPFHNGtb3p7P0POGInySmqWnJy0B0O2neW18A5dRHSLdcXRGPcm2vHZlXMUFwi3CVnEiRRVVMKVEMRbxQQ8B8exyADLjAIwXhXP4IN5KD8MFYVRQ9Wt5k8JZTDRLwLCFMIw0IjNSBIhg4wNSinUgkt+XBWIhShJwxQlHZkXY7dr12DxVnMPiCQpV8ClgTAdTAfBYGwJhyFE6igQkhA1VsWVW3bVsrGvTFUJ2Ehwg8bdw3Cex1OVHENV-QT6EwJhUAwfAIAstcaOsvDkV3ZtLAsbwIlbJJULlWUvLBVVsQ9PCu01IjSDIl4R2uNhx1NR8cnK4lAJZJcQPzMDVx5KzjEk+jZJhJiJTcUxIlRbcYVMDCEj8KMgrqsryMa0iyWTSlqVpOaSAaplF2A0CuVirrS3ictPXMb1kMQ5jEDcXZy1MRw-M83YLwbNINXwJgIDgQxJ32zqNwAWjcaxvDwm8fBhaULysCUAb8GwNksZt218nxt28LT6T7V4-uLbqEGOmTTHlNZnGldYPAlIUZUrDw3FiLCkWQzHmg-KhcfE-HiccEgkeSdZA3DdTUI9KIYjy1t5TDAjZtKhkKvEDm4vxhI3BRYUztPZzTCppwTtyjK6Z2TTZf4khhIgJXDtCXybBvZCkUsFZENsBSElleVYlBeJkgvFmcmxl83ytjdvSbTYRT2VUMNWLKlh2RxgaGxYwWB-2BLnOgQ6gzZ44c-nbHcFLvAUlwcu3NtUocGbuzNracfAg6NzWew7Z9R3ncRQbPBRPy0tDPykd8N6UiAA */
    predictableActionArguments: true,
    strict: true,
    tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
    schema: {
      events: {} as
        | { type: "start_game" }
        | { type: "export" }
        | { type: "reload" }
        | { type: "import" }
        | { type: "screenshot" }
        | { type: "command" },
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
    initial: "starting",
    states: {
      starting: {
        invoke: {
          src: "start",
          onDone: {
            target: "importing",
            actions: "setDriver",
          },
          onError: {
            target: "error",
            actions: logger.error,
          },
        },
      },
      error: {
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
            target: "error",
            actions: logger.error,
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
            target: "error",
            actions: logger.error,
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
            target: "error",
            actions: logger.error,
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
            target: "error",
            actions: logger.error,
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

        const driver = await new Builder().forBrowser(Browser.FIREFOX).setFirefoxOptions(options).build();
        logger.info("fullscreening");
        await driver.manage().window().fullscreen();
        await setupGame(driver);
        return driver;
      },
    },
  },
);
