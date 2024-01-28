import { describe, it, expect } from "vitest";
import { getConfig } from "./index.js";

describe("config", () => {
  it("should not accept the default configuration", () => {
    try {
      getConfig("config.example.toml");
    } catch (e) {
      expect(e).toMatchSnapshot("the configuration should require non-empty fields");
    }
  });
});
