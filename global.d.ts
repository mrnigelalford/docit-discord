declare global {
  namespace NodeJS {
      interface ProcessEnv {
        DISCORD_TOKEN: string;
        APP_ID: string;
        DISCORD_PUBLIC_KEY: string;
        PERMISSIONS: number;
      }
  }
}

export {};