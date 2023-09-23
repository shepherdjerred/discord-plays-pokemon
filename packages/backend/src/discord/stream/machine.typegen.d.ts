// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.Stream.is_logging_in:invocation[0]": {
      type: "done.invoke.Stream.is_logging_in:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "done.invoke.Stream.is_starting:invocation[0]": {
      type: "done.invoke.Stream.is_starting:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    start: "done.invoke.Stream.is_starting:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    setDriver: "done.invoke.Stream.is_starting:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    start: "xstate.init";
  };
  matchesStates:
    | "ending_stream"
    | "is_error"
    | "is_logged_in"
    | "is_logging_in"
    | "is_ready"
    | "is_starting"
    | "starting_stream"
    | "streaming";
  tags: never;
}
