import { createMachine } from "xstate";
import { createWebServer } from "./index.js";
import { getConfig } from "../config/index.js";

export const webMachine = createMachine({
  predictableActionArguments: true,
  strict: true,
  tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
  schema: {
    services: {} as {
      start: {
        data: undefined;
      };
    },
  },
  initial: "ready",
  states: {
    ready: {
      entry: () => {
        createWebServer({
          port: getConfig().web.port,
          isCorsEnabled: getConfig().web.cors,
          isApiEnabled: getConfig().web.api.enabled,
          webAssetsPath: getConfig().web.assets,
        });
      },
    },
  },
});
