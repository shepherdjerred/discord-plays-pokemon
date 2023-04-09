# discord-plays-pokemon

## Requirements

* Docker
* Docker Compose
* [Earthly](https://earthly.dev/get-earthly)

## Discord bot Setup

// TODO

## Instructions

1. Run `cp .env.example .env`
1. Update `.env` with your credentials, Discord server and channel information
1. Run `earthly +up`
1. Navigate to [the emulator management UI](http://localhost:3000)
1. Click "Download"
1. Upload your ROM
    * Go to "File Management"
    * Click "gb"
    * Go to the "roms" folder
    * Right click, upload file, select your ROM
1. Click on "Rom Management"
1. Click "Scan" under "gb"
1. Click "gb"
1. Click "Download All Available Art"
1. Click "Add All Roms to Config"
1. Verify you can play your ROM in the [emulator UI](http://localhost)
1. Run `docker-compose down`
1. Run `earthly +up`

## TODO

- [ ] Check savings works
- [ ] Get Discord to remember logins

## Resources

* <https://aixxe.net/2021/04/discord-video-bot>
