import { Page } from "puppeteer-core";
import { delay } from "./util.js";
import { getStream } from "puppeteer-stream";
import { exec } from "child_process";
import { exit } from "process";

export async function setupGame(emulatorPage: Page) {
    console.log("connecting");
    await emulatorPage.goto("http://emulator");
    console.log("connected");

    await emulatorPage.keyboard.press("ArrowRight");
    // await emulatorPage.waitForNavigation();
    delay(1000);

    await emulatorPage.keyboard.press("ArrowRight");
    // await emulatorPage.waitForNavigation();
    delay(1000);
  }

export async function streamPageToVirtualDisplay(page: Page) {
  const stream = await getStream(page, {
    video: true,
    audio: false,
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000,
    mimeType: "video/webm",
  });

  console.log("pipeing to ffmpeg");
  const ffmpeg = exec(
    "ffmpeg -f webm -i pipe: -vf 'scale=1280:720,fps=30' -f v4l2 -vcodec rawvideo -pix_fmt yuv420p /dev/video0",
    (error, stdout, stderr) => {
      console.error(stderr);
      console.log(stdout);
      console.error(error);

      if (!error || !!stderr) {
        exit();
      }
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
}
