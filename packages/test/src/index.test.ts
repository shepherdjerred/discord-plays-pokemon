import { TestContainer, GenericContainer, StartedTestContainer, StoppedTestContainer } from "testcontainers";

describe("index", () => {
  it("should load the latest save", async () => {
    const container: TestContainer = new GenericContainer("ghcr.io/shepherdjerred/discord-plays-pokemon:latest");
    const startedContainer: StartedTestContainer = await container.start();
    await startedContainer.stop();
  });
});
