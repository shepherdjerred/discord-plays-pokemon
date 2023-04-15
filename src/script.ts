import { Browser, launch } from "puppeteer";
import { setupGame, startGame } from "./puppeteer/emulator.js";
import { shareScreen } from "./puppeteer/discord.js";
import { handleMessages } from "./discord/messageHandler.js";

async function startBrowser(): Promise<Browser> {
  console.log("starting browser");
  const width = 1920;
  const height = 1080;
  const browser = await launch({
    executablePath: "google-chrome-stable",
    userDataDir: "/home/user/data",
    args: [
      "--enable-usermedia-screen-capturing",
      "--auto-select-desktop-capture-source=EmulatorJS",
      `--window-size=${width},${height}`,
      "--disable-software-rasterizer",
      "--disable-frame-rate-limit",
      "--disable-gpu-driver-bug-workarounds",
      "--disable-gpu-driver-workarounds",
      "--disable-gpu-vsync",
      "--enable-accelerated-2d-canvas",
      "--enable-accelerated-video-decode",
      "--enable-accelerated-mjpeg-decode",
      "--enable-unsafe-webgpu",
      "--enable-features=Vulkan,UseSkiaRenderer,VaapiVideoEncoder,VaapiVideoDecoder,CanvasOopRasterization",
      "--disable-features=UseOzonePlatform,UseChromeOSDirectVideoDecoder",
      "--enable-gpu-compositing",
      "--enable-native-gpu-memory-buffers",
      "--enable-gpu-rasterization",
      "--enable-oop-rasterization",
      "--enable-raw-draw",
      "--enable-zero-copy",
      "--ignore-gpu-blocklist",
      "--use-gl=desktop",
    ],
    headless: false,
  });
  return browser;
}

const browser = await startBrowser();
const gpu = await browser.newPage();
gpu.goto("chrome://gpu");
gpu.bringToFront();
const emulatorPage = (await browser.pages())[0];
await setupGame(emulatorPage);
const discordPage = await browser.newPage();
await shareScreen(discordPage);
await startGame(emulatorPage);
await handleMessages(emulatorPage);
(await browser.newPage()).bringToFront();
await emulatorPage.setViewport({
  height: 160,
  width: 240,
});
