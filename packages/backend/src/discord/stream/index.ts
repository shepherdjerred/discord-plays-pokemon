import { By, WebDriver, until } from "selenium-webdriver";
import { wait } from "../../util.js";
import { logger } from "../../logger.js";
import { getConfig } from "../../config/index.js";

export async function navigateToTextChannel(driver: WebDriver) {
  logger.info("navigating to text channel");
  const textChannelUrl = `https://discord.com/channels/${getConfig().server_id}/${
    getConfig().game.commands.channel_id
  }`;
  await driver.get(textChannelUrl);
  logger.info("waiting for text channel to be listed");
  const textChat = await driver.wait(
    until.elementLocated(By.css(`a[data-list-item-id="channels___${getConfig().game.commands.channel_id}"]`)),
  );
  const delay = 5000;
  logger.info(`waiting ${delay}ms for text channel to become clickable`);
  await wait(delay);
  await textChat.click();
  logger.info("navigated to text channel");
}
