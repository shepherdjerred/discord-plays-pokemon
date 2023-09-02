export function delay(milliseconds: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}

export function addErrorLinks(s: string) {
  return `${s}\n\nFor more information, read the setup guide (https://docs.discord-plays-pokemon.com/user/)\nIf you are unable to resolve this error, please open an issue (https://github.com/shepherdjerred/discord-plays-pokemon/issues)\n`;
}
