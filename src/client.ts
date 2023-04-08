import Configuration from "./configuration.js";
import { Client } from "discord.js";

const client = new Client({});

await client.login(Configuration.discordToken);
console.log("logged in")

export default client;
