declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      SERVER_ID: string;
      TEXT_CHANNEL_ID: string;
      VOICE_CHANNEL_ID: string;
      USERNAME: string;
      PASSWORD: string;
      SELF: string;
      ROM_NAME: string;
    }
  }
}

export {};
