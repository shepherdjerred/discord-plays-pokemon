import puppeteer from "puppeteer";
import { launch, getStream } from "puppeteer-stream";
import client from "./client.js";
import configuration from "./configuration.js";
import { exec } from "child_process";

(async () => {
  const browser = await launch({
    defaultViewport: {
      width: 1024,
      height: 768,
    },
    executablePath: puppeteer.executablePath(),
    // userDataDir: "/home/pptruser/data",
    args: ["--use-fake-ui-for-media-stream"],
  });

  console.log("visiting discord");
  const [discordPage] = await browser.pages();

  await discordPage.goto(
    `https://discord.com/channels/${configuration.serverId}/${configuration.textChannelId}`,
    {
      waitUntil: "networkidle0",
    }
  );

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

  // Attempt to join the voice channel.
  console.log("trying to join voice chat");
  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;
  await discordPage.waitForSelector(voiceChannelSelector, { timeout: 0 });
  await discordPage.evaluate(
    (v) => (document.querySelector(v)! as any).click(),
    voiceChannelSelector
  );

  try {
    await discordPage.waitForSelector(
      'button[aria-label="Camera Unavailable"]'
    );
    console.log("camera not working...");
  } catch (error) {
    // happy path
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

  console.log("connecting");
  await emulatorPage.goto("http://emulator");
  console.log("connected");

  await delay(1000);
  emulatorPage.keyboard.press("ArrowRight");
  await delay(1000);
  emulatorPage.keyboard.press("ArrowRight");

  const stream = await getStream(emulatorPage, { video: true, audio: true });

  const ffmpeg = exec(
    `ffmpeg -re -i - -vf 'scale=1280:720,fps=30' -pix_fmt rgb24 -f v4l2 /dev/video0 -f alsa -ac 2 -ar 48000 -c:a pcm_s32le hw:0,1,0`
  );
  ffmpeg.stderr!.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  stream.pipe(ffmpeg.stdin!);
  emulatorPage.bringToFront();

  client.on("message", async (interaction) => {
    switch (interaction.content) {
      case "LEFT":
        emulatorPage.keyboard.press("ArrowLeft");
        interaction.reply("Detected LEFT");
        break;
      case "RIGHT":
        emulatorPage.keyboard.press("ArrowRight");
        interaction.reply("Detected RIGHT");
        break;
      case "UP":
        emulatorPage.keyboard.press("ArrowUp");
        interaction.reply("Detected UP");
        break;
      case "DOWN":
        emulatorPage.keyboard.press("ArrowDown");
        interaction.reply("Detected DOWN");
        break;
      case "A":
        emulatorPage.keyboard.press("A");
        interaction.reply("Detected A");
        break;
      case "B":
        emulatorPage.keyboard.press("B");
        interaction.reply("Detected B");
        break;
      case "SELECT":
        emulatorPage.keyboard.press("Shift");
        interaction.reply("Detected SELECT");
        break;
      case "START":
        emulatorPage.keyboard.press("Enter");
        interaction.reply("Detected START");
        break;
    }
  });
})();

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}
