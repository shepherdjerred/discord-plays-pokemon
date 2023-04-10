import { commandToKeyInput, rawInputToKeyInput, toChord, toCommandInput } from "../src/commandParser.js";

describe("command parser", () => {
  describe("toCommandInput", () => {
    test("works in simple case", () => {
      ["u", "d", "l", "r", "a", "b", "se", "st"].forEach((command) => {
        expect(toCommandInput(command)).toEqual({
          command: command,
          quantity: 1,
        });
      });
    });

    test("can parse quantity", () => {
      expect(toCommandInput("2u")).toEqual({
        command: "u",
        quantity: 2,
      });
    });

    test("can parse multiple digit quantity", () => {
      expect(toCommandInput("20d")).toEqual({
        command: "d",
        quantity: 20,
      });
    });

    test("can parse absurd strings", () => {
      expect(toCommandInput("20000000d")).toEqual({
        command: "d",
        quantity: 20000000,
      });

      // no command
      expect(toCommandInput("")).toEqual(undefined);

      // only quantity
      expect(toCommandInput("2")).toEqual(undefined);

      // invalid command
      expect(toCommandInput("z")).toEqual(undefined);

      // invaid command with quantity
      expect(toCommandInput("2z")).toEqual(undefined);
    });
  });

  describe("toChord", () => {
    test("works in simple case", () => {
      expect(toChord("a a")).toEqual([
        {
          command: "a",
          quantity: 1,
        },
        {
          command: "a",
          quantity: 1,
        },
      ]);

      expect(toChord("2a a 2a a")).toEqual([
        {
          command: "a",
          quantity: 2,
        },
        {
          command: "a",
          quantity: 1,
        },
        {
          command: "a",
          quantity: 2,
        },
        {
          command: "a",
          quantity: 1,
        },
      ]);
    });

    test("works in weird casess", () => {
      expect(toChord("2000a 0a 2a a")).toEqual([
        {
          command: "a",
          quantity: 2000,
        },
        {
          command: "a",
          quantity: 0,
        },
        {
          command: "a",
          quantity: 2,
        },
        {
          command: "a",
          quantity: 1,
        },
      ]);
    });

    test("handles failure", () => {
      expect(toChord("2 a a a")).toEqual(undefined);
      expect(toChord("2 2")).toEqual(undefined);
      expect(toChord("")).toEqual(undefined);
      expect(toChord("applesauce")).toEqual(undefined);
    });
  });

  describe("rawInputToKeyInput", () => {
    expect(rawInputToKeyInput("2a a a")).toEqual(["X", "X", "X", "X"]);
    expect(rawInputToKeyInput("a")).toEqual(["X"]);
    expect(rawInputToKeyInput("2")).toEqual(undefined);
    expect(rawInputToKeyInput("")).toEqual(undefined);
  });

  describe("commandToKeyInput", () => {
    expect(commandToKeyInput({ command: "a", quantity: 2 })).toEqual(["X", "X"]);
  });
});
