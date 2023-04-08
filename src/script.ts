import puppeteer from "puppeteer";
import { launch, getStream } from "puppeteer-stream";
import client from "./client.js";
import { Events } from "discord.js";
import configuration from "./configuration.js";
import { exec } from "child_process";

(async () => {
  const browser = await launch({
    defaultViewport: {
      width: 1024,
      height: 768,
    },
    executablePath: puppeteer.executablePath(),
    userDataDir: "~/data",
  });

  const webClient = (await browser.pages())[0];
  await webClient.goto(
    `https://discord.com/channels/${configuration.serverId}`,
    {
      waitUntil: "networkidle0",
    }
  );

  // Attempt to join the voice channel.
  const voiceChannelSelector = `a[data-list-item-id="channels___${configuration.voiceChannelId}"]`;

  await webClient.waitForSelector(voiceChannelSelector, { timeout: 0 });
  await webClient.evaluate(
    (v) => (document.querySelector(v)! as any).click(),
    voiceChannelSelector
  );

  await webClient.evaluate(() => {
    const enableVideoButton = document.querySelector(
      'button[aria-label="Turn On Camera"]'
    );
    const disableVideoButton = document.querySelector(
      'button[aria-label="Turn Off Camera"]'
    );

    if (disableVideoButton !== null) return;

    if (enableVideoButton !== null) return (enableVideoButton as any).click();
  });

  const page = await browser.newPage();

  console.log("connecting");
  await page.goto("http://emulator");
  console.log("connected");

  await delay(1000);
  page.keyboard.press("ArrowRight");
  await delay(1000);
  page.keyboard.press("ArrowRight");

  const stream = await getStream(page, { video: true, audio: true });

  const ffmpeg = exec(
    `ffmpeg -re -i - -vf 'scale=1280:720,fps=30' -pix_fmt rgb24 -f v4l2 /dev/video0 -f alsa -ac 2 -ar 48000 -c:a pcm_s32le hw:0,1,0`
  );
  ffmpeg.stderr!.on("data", (chunk) => {
    console.log(chunk.toString());
  });

  stream.pipe(ffmpeg.stdin!);

  client.on(Events.MessageCreate, async (interaction) => {
    switch (interaction.content) {
      case "LEFT":
        page.keyboard.press("ArrowLeft");
        interaction.reply("Detected LEFT");
        break;
      case "RIGHT":
        page.keyboard.press("ArrowRight");
        interaction.reply("Detected RIGHT");
        break;
      case "UP":
        page.keyboard.press("ArrowUp");
        interaction.reply("Detected UP");
        break;
      case "DOWN":
        page.keyboard.press("ArrowDown");
        interaction.reply("Detected DOWN");
        break;
      case "A":
        page.keyboard.press("A");
        interaction.reply("Detected A");
        break;
      case "B":
        page.keyboard.press("B");
        interaction.reply("Detected B");
        break;
      case "SELECT":
        page.keyboard.press("Shift");
        interaction.reply("Detected SELECT");
        break;
      case "START":
        page.keyboard.press("Enter");
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
