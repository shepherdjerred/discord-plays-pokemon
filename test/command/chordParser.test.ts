import { commandToGameboyAdvanceKeyInput, parseGameboyAdvanceKeyInput } from "../../src/command/keybinds.js";

describe("keybinds", () => {
  describe("parseGameboyAdvanceKeyInput", () => {
    expect(parseGameboyAdvanceKeyInput("2a a a")).toEqual(["X", "X", "X", "X"]);
    expect(parseGameboyAdvanceKeyInput("a")).toEqual(["X"]);
    expect(parseGameboyAdvanceKeyInput("2")).toEqual(undefined);
    expect(parseGameboyAdvanceKeyInput("")).toEqual(undefined);
    // test that we don't crash on uppercase commands
    expect(parseGameboyAdvanceKeyInput("A")).toEqual(["X"]);
  });

  describe("commandToGameboyAdvanceKeyInput", () => {
    expect(commandToGameboyAdvanceKeyInput({ command: "a", quantity: 2 })).toEqual(["X", "X"]);
  });
});
