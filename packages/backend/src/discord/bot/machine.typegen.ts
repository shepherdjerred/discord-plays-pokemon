// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  internalEvents: {
    "done.invoke.(machine).logging_in:invocation[0]": {
      type: "done.invoke.(machine).logging_in:invocation[0]";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
  };
  invokeSrcNameMap: {
    login: "done.invoke.(machine).logging_in:invocation[0]";
  };
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    setClient: "done.invoke.(machine).logging_in:invocation[0]";
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {
    login: "xstate.init";
  };
  matchesStates: "is_error" | "listening" | "logging_in";
  tags: never;
}
