import { Events, Message, VoiceState } from "discord.js";
import client from "./client.js";
import { Observable } from "rxjs";

export function createMessageObservable() {
  return new Observable<Message>((subscriber) => {
    client.on(Events.MessageCreate, (message) => {
      subscriber.next(message);
    });
  });
}

export function createVoiceStateObservable() {
  return new Observable<{ oldState: VoiceState; newState: VoiceState }>((subscriber) => {
    client.on(Events.VoiceStateUpdate, (oldState, newState) =>
      subscriber.next({
        oldState,
        newState,
      }),
    );
  });
}
