import { Client, Events, GatewayIntentBits } from "discord.js";
import { assign, createMachine } from "xstate";
import { logger } from "../../logger.js";
import { registerSlashCommands } from "./slashCommands/rest.js";
import { help } from "./slashCommands/commands/help.js";

export function createBotMachine({ botToken }: { botToken: string }) {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOgBsB7KKAqAfQIGIILCSCA3CgazBLSx5CpStVoN8CThUzoALrlYBtAAwBdVWsSgADhVi4FrbSAAeiAEwqAzCQCMKuwFYAbBacAaEAE9EADlsVC2sAFmsAdicAXyivARwCYnIqGnx6JjAAJ0yKTJIdMnkAM1zUfgwE4WSxNIkpfC5ZI3xNTRM9A2aTcwQrWwdnN08fRDtwlxIQ8dd3GNiQfAoIOBN4oWJ2-UNFfG7EAFoXL18EQ5i4ivWRFPECTc6dvYQQi2PEAE4nEkjzkDXE0i4WB0LI5TL3bbGJBmRChCz2cJ2PyRN4IOzvcIkPp2Wbzf5VTJgdAQE66LZdaE9OEIpEokYIPx2EjROZAA */
      predictableActionArguments: true,
      tsTypes: {} as import("./machine.typegen.d.ts").Typegen0,
      schema: {
        context: {} as { client: Client | undefined },
        services: {} as {
          login: {
            data: Client;
          };
        },
      },
      context: {
        client: undefined,
      },
      initial: "logging_in",
      states: {
        logging_in: {
          invoke: {
            src: "login",
            onDone: {
              target: "listening",
              actions: "setClient",
            },
            onError: {
              target: "is_error",
              actions: (_context: unknown, event: unknown) => {
                logger.error(event);
              },
            },
          },
        },
        is_error: {
          type: "final",
        },
        listening: {
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
          await registerSlashCommands();
          return client;
        },
      },
    },
  );
}
