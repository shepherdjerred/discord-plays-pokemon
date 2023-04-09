# discord-plays-pokemon

[![Netlify Status](https://api.netlify.com/api/v1/badges/74b8286f-3e2f-4b8e-87bf-d9043c307c33/deploy-status)](https://app.netlify.com/sites/discord-plays-pokemon/deploys)

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=625072124)

## Requirements

- Docker
- Docker Compose
- [Earthly](https://earthly.dev/get-earthly)

## Discord bot Setup

// TODO

## Instructions

1. Copy the default configuration with `cp .example.env .env`
1. Update `.env` with your credentials, Discord server and channel information
1. Run `earthly +up`
1. Navigate to [the emulator management UI](http://localhost:3000)
1. Click "Download"
1. Upload your ROM
   - Go to "File Management"
   - Click "gb"
   - Go to the "roms" folder
   - Right click, upload file, select your ROM
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

- <https://aixxe.net/2021/04/discord-video-bot>
