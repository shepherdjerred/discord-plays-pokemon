// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.Discord I/O Machine.logging_in:invocation[0]": {
      type: "done.invoke.Discord I/O Machine.logging_in:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    listen: "done.invoke.Discord I/O Machine.listening:invocation[0]";
    login: "done.invoke.Discord I/O Machine.logging_in:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    setClient: "done.invoke.Discord I/O Machine.logging_in:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    listen: "done.invoke.Discord I/O Machine.logging_in:invocation[0]";
    login: "xstate.init";
  };
  matchesStates: "is_error" | "listening" | "logging_in";
  tags: never;
}
