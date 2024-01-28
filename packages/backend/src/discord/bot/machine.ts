import { Client, Events, GatewayIntentBits, Message, VoiceState } from "discord.js";
import { assign, createMachine } from "xstate";
import { logger } from "../../logger.js";
import { registerSlashCommands } from "./slashCommands/rest.js";
import { help } from "./slashCommands/commands/help.js";

export function createBotMachine({
  botToken,
  areScreenshotsEnabled,
}: {
  botToken: string;
  areScreenshotsEnabled: boolean;
}) {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7KKAqAfQIGIILCSCA3CgazBLSx5CpStVoN8CThUzoALrlYBtAAwBdVWsSgADhVi4FrbSAAeiAEwqAzCQCMKuwFYAbBacAaEAE9EADlsVC2sAFmsAdicAXyivARwCYnIqGnx6JjAAJ0yKTJIdMnkAM1zUfgwE4WSxNIkpfC5ZI3xNTRM9A2aTcwQrWwdnN08fRDtwlxIQ8dd3GNiQfAoIOBN4oWJ2-UNFfG7EAFoXL18EQ5i4ivWRFPECTc6dvYQQi2PEAE4nEkjzkDXE0i4WB0LI5TL3bbGJBmRChCz2cJ2PyRN4IOzvcIkPp2Wbzf5VMhAuRgfC0CFdaE9OEIpEokYIPx2EjROZAA */
      id: "Discord I/O Machine",
      predictableActionArguments: true,
      strict: true,
      tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
      schema: {
        events: {} as
          | { type: "screenshot" }
          | { type: "message"; data: Message }
          | { type: "voice_state_update"; data: { oldState: VoiceState; newState: VoiceState } },
        context: {} as { client: Client | undefined },
        services: {} as {
          login: {
            data: Client;
          };
          listen: {
            data: undefined;
          };
        },
      },
      context: {
        client: undefined,
      },
      initial: "logging_in",
      states: {
        error: {
          type: "final",
        },
        logging_in: {
          invoke: {
            src: "login",
            onDone: {
              target: "listening",
              actions: "setClient",
            },
            onError: {
              target: "error",
              actions: logger.error,
            },
          },
        },
        listening: {
          invoke: {
            src: "listen",
            onError: {
              target: "error",
              actions: logger.error,
            },
          },
        },
      },
    },
    {
      actions: {
        setClient: (_content, event) => assign({ client: event.data }),
      },
      services: {
        login: async (): Promise<Client> => {
          const client = new Client({
            intents: [
              GatewayIntentBits.Guilds,
              GatewayIntentBits.MessageContent,
              GatewayIntentBits.GuildMessages,
              GatewayIntentBits.GuildVoiceStates,
            ],
          });
          await client.login(botToken);
          await registerSlashCommands({ botToken, areScreenshotsEnabled });
          return client;
        },
        listen:
          ({ client }, _event) =>
          (sendBack, _onReceive) => {
            if (!client) {
              throw Error();
            }

            client.on(Events.MessageCreate, (message) => {
              sendBack({ type: "message", data: message });
            });

            client.on(Events.VoiceStateUpdate, (oldState, newState) => {
              sendBack({ type: "voice_state_update", data: { oldState, newState } });
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
  );
}
