import puppeteer from "puppeteer";
import { Page } from "puppeteer-core";
import { launch, getStream } from "puppeteer-stream";
import client from "./client.js";
import configuration from "./configuration.js";
import { exec } from "child_process";

async function login(discordPage: Page) {
  console.log("loggging in");
  // enter email
  const emailtarget = await discordPage.waitForSelector("input[name=email]", {
    visible: true,
  });
  await emailtarget!.type(configuration.username);

  // enter password
  const passtarget = await discordPage.waitForSelector("input[name=password]", {
    visible: true,
  });
  await passtarget!.type(configuration.password);

  // submit
  const submitBtn = await discordPage.waitForSelector("button[type=submit]", {
    visible: true,
  });
  await submitBtn!.click();

  // wait for redirection
  await discordPage.waitForNavigation();
  console.log("logged in");
}

console.log("starting browser");
const browser = await launch({
  executablePath: puppeteer.executablePath(),
  userDataDir: "/home/pptruser/data",
  args: [],
});

console.log("overriding permissions");
const context = browser.defaultBrowserContext();
await context.overridePermissions("https://discord.com", [
  "camera",
  "microphone",
]);

console.log("visiting discord");
const [discordPage] = await browser.pages();

const channelUrl = `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`;
await discordPage.goto(channelUrl, {
  waitUntil: "networkidle0",
});

if (discordPage.url().startsWith("https://discord.com/login")) {
  console.log("not logged in");
  await login(discordPage);
} else {
  console.log(discordPage.url());
  console.log("already logged in");
}

// Attempt to join the voice channel.
console.log("trying to join voice chat");
const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
await discordPage.waitForSelector(voiceChannelSelector, { timeout: 0 });
await discordPage.evaluate(
  (v) => (document.querySelector(v)! as any).click(),
  voiceChannelSelector
);

try {
  await discordPage.waitForSelector('button[aria-label="Camera Unavailable"]', {
    timeout: 1,
  });
  console.log("camera not working...");
} catch (error) {
  console.log("camera is working 🎉🎉🎉");
}

console.log("turning on video");
const videoSelector = 'button[aria-label="Turn On Camera"]';
await discordPage.waitForSelector(videoSelector, { timeout: 0 });
await discordPage.evaluate(
  (v) => (document.querySelector(v)! as any).click(),
  videoSelector
);

console.log("video is streaming...");

const emulatorPage = await browser.newPage();
await emulatorPage.bringToFront();

console.log("connecting");
await emulatorPage.goto("http://emulator");
console.log("connected");

await emulatorPage.keyboard.press("ArrowRight");
// await emulatorPage.waitForNavigation();
delay(1000);

await emulatorPage.keyboard.press("ArrowRight");
// await emulatorPage.waitForNavigation();
delay(1000);

console.log("getting page...");
const stream = await getStream(emulatorPage, {
  video: true,
  audio: false,
  audioBitsPerSecond: 128000,
  videoBitsPerSecond: 2500000,
  mimeType: "video/webm",
});

console.log("pipeing to ffmpeg");
const ffmpeg = exec(
  "ffmpeg -f webm -r 30 -i pipe:0 -vf 'scale=1280:720,fps=30' -pixfmt=yuv420p -f v4l2 /dev/video0",
  (error, stdout, stderr) => {
    console.error(stderr);
    console.log(stdout);
    console.error(error);
  }
);
if (ffmpeg.stderr) {
  console.log("connected to stderr");
  ffmpeg.stderr.on("data", (chunk) => {
    console.error(chunk.toString());
  });
} else {
  console.error("could not attach to stderr");
}
if (ffmpeg.stdin) {
  console.log("connected to stdin");
  stream.pipe(ffmpeg.stdin);
} else {
  console.log("could not attach to stdin");
}

console.log("ready for commands");

client.on("message", async (interaction) => {
  console.log(interaction);
  switch (interaction.content) {
    case "LEFT":
      await emulatorPage.keyboard.press("ArrowLeft");
      await interaction.reply("Detected LEFT");
      break;
    case "RIGHT":
      await emulatorPage.keyboard.press("ArrowRight");
      await interaction.reply("Detected RIGHT");
      break;
    case "UP":
      await emulatorPage.keyboard.press("ArrowUp");
      await interaction.reply("Detected UP");
      break;
    case "DOWN":
      await emulatorPage.keyboard.press("ArrowDown");
      await interaction.reply("Detected DOWN");
      break;
    case "A":
      await emulatorPage.keyboard.press("A");
      await interaction.reply("Detected A");
      break;
    case "B":
      await emulatorPage.keyboard.press("B");
      await interaction.reply("Detected B");
      break;
    case "SELECT":
      await emulatorPage.keyboard.press("Shift");
      interaction.reply("Detected SELECT");
      break;
    case "START":
      await emulatorPage.keyboard.press("Enter");
      await interaction.reply("Detected START");
      break;
  }
});

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
