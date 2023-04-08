declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      SERVER_ID: string;
      TEXT_CHANNEL_ID: string;
      VOICE_CHANNEL_ID: string;
    }
  }
}

export {};
