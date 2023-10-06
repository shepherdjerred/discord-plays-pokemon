import { describe, test } from "vitest";

import { interpret } from "xstate";
import { streamMachine } from "./machine.js";

describe("states", () => {
  test.skip(
    "able to reach the ready state",
    () =>
      new Promise<void>((done) => {
        const actor = interpret(streamMachine).onTransition((state) => {
          if (state.matches("ready")) {
            done();
          }
        });
        actor.start();
      }),
    10000,
  );

  test.skip(
    "able to reach the streaming state",
    () =>
      new Promise<void>((done) => {
        const actor = interpret(streamMachine).onTransition((state) => {
          if (state.matches("ready")) {
            actor.send({ type: "start_stream" });
          }
          if (state.matches("streaming")) {
            done();
          }
        });
        actor.start();
      }),
    25000,
  );

  test.skip(
    "able to reach the streaming state",
    () =>
      new Promise<void>((done) => {
        let hasStreamed = false;
        const actor = interpret(streamMachine).onTransition((state) => {
          if (state.matches("ready")) {
            if (hasStreamed) {
              done();
            } else {
              actor.send({ type: "start_stream" });
            }
          }
          if (state.matches("streaming")) {
            hasStreamed = true;
            actor.send({ type: "end_stream" });
          }
        });
        actor.start();
      }),
    25000,
  );
});
