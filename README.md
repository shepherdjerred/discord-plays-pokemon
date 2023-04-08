# discord-plays-pokemon

## Requirements

* Ubuntu 22.04 (Jammy)
* The host must be able to install kernel modules (e.g., you cannot be running in Docker)

The following are required, and will be installed automatically with the `bootstrap.sh` script:

* Docker
* Docker Compose
* [Earthly](https://earthly.dev/get-earthly)

## Discord bot Setup

// TODO

## Environment Setup

This was developed and deployed on AWS, but it should work on any Ubuntu 22.04 host, as long as you are able to install kernel modules with [DKMS](https://en.wikipedia.org/wiki/Dynamic_Kernel_Module_Support)

1. Setup an EC2 instance with Ubuntu 22.04 (Jammy)
2. Run `bootstrap.sh`
3. Run `setup.sh`
4. Follow the instructions below


## Instructions

1. Run `cp .env.example .env`
1. Update `.env` with your credentials, Discord server and channel information
1. Run `setup.sh` on the host
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

## Resources

* <https://aixxe.net/2021/04/discord-video-bot>
