# Discord Plays Pokémon

This application allows your Discord server to play a cooperative game of Pokémon (or any other Gameboy Advanced ROM) using Discord as the input method. The concept is similar to that of [Twitch Plays Pokémon](https://en.wikipedia.org/wiki/Twitch_Plays_Pok%C3%A9mon)

## Requirements

- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Earthly](https://earthly.dev/get-earthly)

## Usage without Docker

You can use this without Docker by building this application with `npm install`, `npm run build`, and `./run.sh`.

!!! note

    You will need to have Firefox installed, and possibly other software. You might also still want to have a GPU so that Discord streaming is hardware accelerated.
