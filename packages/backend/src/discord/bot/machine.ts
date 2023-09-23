import { Client, Events, GatewayIntentBits } from "discord.js";
import { assign, createMachine } from "xstate";
import { getConfig } from "../../config/index.js";
import { logger } from "../../logger.js";
import { registerSlashCommands } from "./slashCommands/rest.js";
import { help } from "./slashCommands/commands/help.js";

export const botMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7KKAqAfQIGIILCSCA3CgazBLSx5CpStVoN8CThUzoALrlYBtAAwBdVWsSgADhVi4FrbSAAeiAEwqAbCRsWArABoQAT0QAOAMx2LXgCxeAOwOAL6hLgI4BMTkVDT49ExgAE4pFCkkOmTyAGYZqPwY0cJxYokSUvhcskb4mpomegZ1JuYIVrb2zm6IAIxBtv6DDtaO4REg+BQQcCZRQsRN+oaK+G2IALTWLu4I2+GRxYsi8eIEyy1rGwj+FruIAJwOJCGHIAsxpLiwdKnpKUuq2MSDMiC81j6JEe1hUj2CPT2fUeQRIVi8fXGk0+pRSYHQED2uhWrVB7QhUJhcIRDwQHihYQmQA */
  predictableActionArguments: true,
  schema: {
    context: {} as { client: Client | undefined },
  },
  context: {
    client: undefined,
  },
  initial: "logging_in",
  states: {
    logging_in: {
      invoke: {
        src: async () => {
          const client = new Client({
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildVoiceStates,
            ],
          });
          await client.login(getConfig().bot.discord_token);
          await registerSlashCommands();
          return client;
        },
        onDone: {
          target: "ready",
          actions: assign({ client: (_context, event) => event.data }),
        },
        onError: {
          target: "is_error",
          actions: (_context, event) => {
            logger.error(event);
          },
        },
      },
    },
    is_error: {
      type: "final",
    },
    ready: {
      invoke: {
        src:
          ({ client }, _event) =>
          (sendBack, _onReceive) => {
            if (!client) {
              throw Error();
            }

            client.on(Events.MessageCreate, (message) => {
              sendBack({ type: "message", data: message });
            });

            client.on(Events.VoiceStateUpdate, (oldState, newState) => {
              sendBack({ type: "message", data: { oldState, newState } });
            });

            client.on(Events.InteractionCreate, async (interaction) => {
              try {
                if (!interaction.isChatInputCommand()) {
                  return;
                }
                switch (interaction.commandName) {
                  case "screenshot":
                    sendBack({ type: "screenshot" });
                    break;
                  case "help":
                    await help(interaction);
                }
              } catch (e) {
                logger.error(e);
              }
            });
          },
      },
    },
  },
});
