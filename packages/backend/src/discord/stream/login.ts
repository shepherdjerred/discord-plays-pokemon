import { WebDriver, until, By } from "selenium-webdriver";
import { getConfig } from "../../config/index.js";
import { logger } from "../../logger.js";

export async function isLoggedIn(driver: WebDriver): Promise<boolean> {
  logger.info("going to main app page");
  const appPage = "https://discord.com/app";
  await driver.get(appPage);

  logger.info("waiting for redirect");
  await driver.wait(async (driver) => {
    return (await driver.getCurrentUrl()) != appPage;
  });

  const url = await driver.getCurrentUrl();
  if (url.startsWith("https://discord.com/login")) {
    logger.info("not logged in");
    return false;
  } else {
    logger.info("already logged in");
    return true;
  }
}

export async function login(driver: WebDriver) {
  logger.info("logging in via website");
  await driver.get("https://discord.com/login");

  logger.info("typing email");
  const emailInput = driver.wait(until.elementLocated(By.css("input[name=email]")));
  await emailInput.sendKeys(getConfig().stream.userbot.username);

  logger.info("typing password");
  const passwordInput = driver.wait(until.elementLocated(By.css("input[name=password]")));
  await passwordInput.sendKeys(getConfig().stream.userbot.password);

  logger.info("click submit button");
  const submitButton = driver.wait(until.elementLocated(By.css("button[type=submit]")));
  await submitButton.click();

  logger.info("waiting for redirect");
  await driver.wait(until.urlContains("https://discord.com/channels/"));
  logger.info("logged in");

  // TODO: persist login token
}
