import { interpret } from "xstate";
import { streamMachine } from "./index.js";

describe("states", () => {
  test("can reach streaming state", (done) => {
    const actor = interpret(streamMachine).onTransition((state) => {
      if (state.matches("is_ready")) {
        actor.send({ type: "start_stream" });
      }
      if (state.matches("is_ready")) {
        done();
      }
    });
    actor.start();
  }, 25000);
});
