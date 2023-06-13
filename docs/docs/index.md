# Discord Plays Pokémon

This application allows your Discord server to play a cooperative game of Pokémon (or any other Gameboy Advanced ROM) using Discord as the input method. The concept is similar to that of [Twitch Plays Pokémon](https://en.wikipedia.org/wiki/Twitch_Plays_Pok%C3%A9mon)

## How It Works

This application is written in [TypeScript](https://www.typescriptlang.org/). It uses [Selenium Webdriver](https://github.com/SeleniumHQ/selenium) to create a Firefox browser. The application opens two tabs, one for Discord to stream the game, and another to run [EmulatorJS](https://www.emulatorjs.com/), an emulator for many older system that runs directly in the browser.

The application will then login as a real Discord user through the browser, join a voice channel, and start streaming the browser window. The application will then focus the emulator tab so that it is being streamed.

The last component is a Discord bot to handle commands. The application will start a Discord bot that listens for commands in a text channel. When a command is recieved, the bot will send input to the emulator through Selenium.

Two bots are required because Discord bots are unable to stream video, and normal user accounts are unable to register slash commands. There is no way around this limitation.

The process described above allows everything to be done in-browser, which makes this application considerably more portable than alternatives. Additionally, a Docker image is bundled with the application that allows this entire process to happen without any dependencies aside from Docker on the host machine.

!!! warning
The Docker image runs a full copy of Desktop Linux. In order for streaming to work smoothly, you'll need either a _very_ fast CPU, or a GPU. The [nvidia-docker](https://github.com/NVIDIA/nvidia-docker) project allows Docker containers to use host GPU resources, and it is _strongly_ recommended to be used with the Docker image.

## Usage on AWS

This image can run smoothly on AWS instances with GPUs. I've tested this thorougly on a `g4dn.2xlarge` instance, which is reasonably priced as long as you shut down the instance when the bot is not in use.

The `ec2-bootstrap.sh` script can be used to setup an AWS EC2 instance. It will:

- Install Docker
- Install Earthly
- Install all required Nvidia software

!!! note
You must use an EC2 instance with x86\*64 CPU, and a Nvidia GPU. It will not work on arm64 or AMD GPU instances. You can try running this on AWS _without_ a GPU, but it will be extremely slow.

## Usage without Docker

You can use this without Docker by:

- Hosting the `static/` directory with the webserver of your choice
- Updating the application to point to your webserver rather than the Dockerized webserver (note: this should be a configuration option in the future)
- Building this application with `npm install`, `npm run build`, and `./run.sh`.

!!! note
You will need to have Firefox installed, and possibly other software. You might also still want to have a GPU so that Discord streaming is hardware accelerated.

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Earthly](https://earthly.dev/get-earthly)

## Setup

This is not very easy to use because there are a lot of components to get this working. It will also require a bit of manual work on each startup due to some processes I have not yet automated.

### Discord Bot Setup

1. Create a Discord application in the [Discord Developer Portal](https://discord.com/developers/applications)
1. Copy the application ID and save it for later
1. Generate a bot token and save the value for later
1. Enable the `MESSAGE CONTENT` intent
1. On the OAuth2 tab, use the URL Generator

Set the following permissions:

- `bot`
- `add reactions`
- `send messages`
- `attach files`
- `embed links`

Copy the URL, open it in another tab, and add the bot to your server.

### Userbot Setup

This section can be skipped if you already have a spare Discord account to use as the streamer (sometimes this is known as a [userbot](https://support.discord.com/hc/en-us/articles/115002192352-Automated-user-accounts-self-bots-))

!!! warning
Discord does not like user bots. Please be careful.

1. Create a new Discord user just for this application
2. Invite the userbot to your server

### Application Configuration

1. Open up Discord, go to `Settings > Advanced` and turn on `Developer Mode` -- this will make it easier for you to get some values
1. Clone this project somewhere
1. Copy `.example.env` to `.env`

Edit `.env`:

- Set `HELPER_DISCORD_TOKEN` to your BOT TOKEN **Note:** This is _not_ related to your userbot
- Set `STREAMER_ID` to the user ID of your userbot. You can right-click your username and click `Copy User ID` to get this
- Set `STREAMER_USERNAME` to your userbot's username
- Set `STREAMER_PASSWORD` to your userbot's password
- Set `APPLICATION_ID` to the value you copied when setting up your bot
- Set `SERVER_ID` to the ID of the server you want the bot to join. You can get this by right-clicking your server icon, and selecting `Copy Server ID`
- Set `COMMAND_TEXT_CHANNEL_ID` to the ID of the text channel you want to use for bot commands. You probably want to make a separate channel just for this. You can get this by right-click your text channel name, and selecting `Copy Channel ID`
- Set `NOTIFICATIONS_TEXT_CHANNEL_ID` to the ID of the channel you want to use for bot notifications, like when a screenshot is taken, or when the bot starts up.
- Set `VOICE_CHANNEL_ID` to the ID of the voice channel you want the game stream to be in.

The other values can be tweaked if desired, but the defaults are probably reasonable.

### Starting the Bot

Put your desired ROM in `static/roms/`. Edit `static/index.html` with the name of the ROM you want to use -- the default is `liquid_crystal.gba`.

!!! note
This application only works out-of-the-box with Gameboy Advanced ROMs, although it wouldn't be too hard to extend this application for additional systems that EmulatorJS supports.

Run `earthly +up`. This will build the application and start the Docker containers. On your machine, navigate to [http://localhost:8080](http://localhost:8080). Login with the credentials `user` and `password`. This will stream the virtual Linux desktop's screen to your browser, where you can see program execution and interact with the game and Discord application directly.

### Discord Settings

Be sure the Discord is logged into correctly. Sometimes you'll need to solve a captcha, like when you login for the first time, or if you haven't logged in for a while.

Once logged into Discord, the bot should automatically join the voice channel and stream the game. You should make a few changes to the Discord settings.

!!! note
These settings are _not_ saved, so you'll have to do this every time the application is started. These settings should be changed:

- Output volume should be set to 0%, or there will be an echo
- Soundboard volume should be set to 0%, or there will be an echo
- Automatically determine input sensitivty should be off, and the slider moved as far to the left as possible
- Echo cancellation should be off
- Automatic gain control should be off

After changing these settings, go back to the game window.

### Game Saves

Game saves are stored to the browser storage, which is reset when the application is closed. **SAVING IN-GAME IS NOT ENOUGH!** You need to use the in-game save menu, and then click the "Export Save" in the top-right of the game window. Every time the game is restarted you'll need to click "Import Save" and upload your save file. Be careful to not rely on the in-game save menu by itself! You _must_ do both steps if you want to save your progress. There is _absolutely no way_ to recover your progress if you close the application/Docker container without first saving.

!!! note
The directory the saves are exported to (`~/Downloads`) is mounted to a Docker volume named `browser-downloads`, so those files will be persisted. It would be a good idea to make a backup of your save files; for example you could send them to your Discord channel after finishing up a session as a failsafe.

### Using the Bot

Okay! After setup is complete, you're ready to go. The bot has the following commands:

- `/help`: Show available chat commands
- `/screenshot`: Take a screenshot and post it to the notifications channel

Run the `/help` command for information about playing games with this bot, such as the controls. That command is generated by the application based on your configured settings and the command bindings, so it will always be up-to-date.

As a quick example, here's what you can do by typing in your text channel

```text
u     # press the 'up' button
5u    # press 'up' five times
a     # press 'a'
a b   # press 'a' then 'b'
start # press 'start'
```

Multiple players can run commands at the same time.

## Developing

This is a pretty standard TypeScript application. Install dependencies with `npm i`. Build the application with `npm run build`. Run tests with `npm run test`.
