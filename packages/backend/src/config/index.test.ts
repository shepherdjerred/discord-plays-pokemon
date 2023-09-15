import { getConfig } from "./index.js";

describe("config", () => {
  it("should not load the default configuration", () => {
    try {
      getConfig("../../config.example.toml");
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
});
