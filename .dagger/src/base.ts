import { Container, dag } from "@dagger.io/dagger";

/**
 * Get a Node.js container with common setup
 * @returns A container with Node.js LTS installed
 */
export function getNodeContainer(): Container {
  return dag.container().from("node:lts").withWorkdir("/workspace").withExec(["npm", "install", "-g", "npm@latest"]);
}

/**
 * Get a container with GitHub CLI installed
 * @returns A container with GitHub CLI
 */
export function getGitHubContainer(): Container {
  return dag.container().from("ghcr.io/cli/cli:latest").withWorkdir("/workspace");
}

/**
 * Get a container suitable for Docker builds
 * @returns A container with Docker buildx
 */
export function getDockerContainer(): Container {
  return dag.container().from("docker:dind").withWorkdir("/workspace");
}
