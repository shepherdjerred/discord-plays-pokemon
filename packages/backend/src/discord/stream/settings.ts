import { WebDriver } from "selenium-webdriver";
import { logger } from "../../logger.js";

export async function updateSettings(driver: WebDriver) {
  logger.info("executing script to update discord settings");
  // https://stackoverflow.com/questions/52509440/discord-window-localstorage-is-undefined-how-to-get-access-to-the-localstorage
  await driver.executeScript(`
    (() => {
      function getLocalStoragePropertyDescriptor() {
        const iframe = document.createElement('iframe');
        document.head.append(iframe);
        const pd = Object.getOwnPropertyDescriptor(iframe.contentWindow, 'localStorage');
        iframe.remove();
        return pd;
      }

      Object.defineProperty(window, 'localStorage', getLocalStoragePropertyDescriptor())

      const currentSettings = JSON.parse(window.localStorage.getItem("MediaEngineStore"));
      currentSettings.default.outputVolume = 0;
      currentSettings.stream.outputVolume = 0;
      currentSettings.default.modeOptions.threshold = -100;
      currentSettings.stream.modeOptions.threshold = -100;
      currentSettings.default.echoCancellation = false;
      currentSettings.stream.echoCancellation = false;
      currentSettings.default.automaticGainControl = false;
      currentSettings.stream.automaticGainControl = false;
      window.localStorage.setItem("MediaEngineStore", JSON.stringify(currentSettings));

      window.localStorage.setItem("hotspots", '{"_state":{"hiddenHotspots":["VOICE_PANEL_INTRODUCTION","VOICE_CALL_FEEDBACK"],"hotspotOverrides":{}},"_version":1}');
    })();
  `);
  logger.info("refreshing page to update settings");
  await driver.navigate().refresh();
}
