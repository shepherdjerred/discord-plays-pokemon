import { createMachine } from "xstate";
import { gameMachine } from "./game/machine.js";
import { streamMachine } from "./discord/stream/machine.js";
import { webMachine } from "./webserver/machine.js";

export const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5gF8A0IB2B7CdGgAoBbAQwGMALASwzAEp8QAHLWKgFyqw0YA9EAjACZ0AT0FDkU5EA */
    predictableActionArguments: true,
    strict: true,
    tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
    schema: {},
    invoke: [
      {
        src: "web",
      },
      {
        src: "game",
      },
      {
        src: "stream",
      },
    ],
    states: {},
  },
  {
    services: {
      game: gameMachine,
      stream: streamMachine,
      web: webMachine,
    },
    actions: {},
  },
);
