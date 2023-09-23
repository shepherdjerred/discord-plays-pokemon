
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.(machine).importing:invocation[0]": { type: "done.invoke.(machine).importing:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).is_starting:invocation[0]": { type: "done.invoke.(machine).is_starting:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.(machine).reload:invocation[0]": { type: "done.invoke.(machine).reload:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "start": "done.invoke.(machine).is_starting:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "setDriver": "done.invoke.(machine).is_starting:invocation[0]";
        };
        eventsCausingDelays: {

        };
        eventsCausingGuards: {

        };
        eventsCausingServices: {
          "start": "xstate.init";
        };
        matchesStates: "exporting" | "importing" | "is_error" | "is_starting" | "playing" | "reload" | "start_playing";
        tags: never;
      }
