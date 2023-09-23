import { describe, test } from "vitest";

import { interpret } from "xstate";
import { streamMachine } from "./machine.js";

describe("states", () => {
  test.skip("able to reach the ready state", (done) => {
    const actor = interpret(streamMachine).onTransition((state) => {
      if (state.matches("is_ready")) {
        done();
      }
    });
    actor.start();
  }, 10000);

  test.skip("able to reach the streaming state", (done) => {
    const actor = interpret(streamMachine).onTransition((state) => {
      if (state.matches("is_ready")) {
        actor.send({ type: "start_stream" });
      }
      if (state.matches("is_streaming")) {
        done();
      }
    });
    actor.start();
  }, 25000);

  test.skip("able to reach the streaming state", (done) => {
    let hasStreamed = false;
    const actor = interpret(streamMachine).onTransition((state) => {
      if (state.matches("is_ready")) {
        if (hasStreamed) {
          done();
        } else {
          actor.send({ type: "start_stream" });
        }
      }
      if (state.matches("is_streaming")) {
        hasStreamed = true;
        actor.send({ type: "end_stream" });
      }
    });
    actor.start();
  }, 25000);
});
