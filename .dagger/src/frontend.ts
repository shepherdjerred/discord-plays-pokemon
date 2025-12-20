import { Directory, Container } from "@dagger.io/dagger";
import { getBunContainer } from "@shepherdjerred/dagger-utils";
import { getCommonPackage } from "./common";

/**
 * Install dependencies for the frontend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with dependencies installed
 */
export async function installFrontendDeps(workspaceSource: Directory): Promise<Container> {
  // First get the common package
  const commonDir = await getCommonPackage(workspaceSource);

  return getBunContainer()
    .withFile("/workspace/package.json", workspaceSource.file("package.json"))
    .withFile("/workspace/bun.lock", workspaceSource.file("bun.lock"))
    .withDirectory("/workspace/packages/frontend", workspaceSource.directory("packages/frontend"))
    .withDirectory("/workspace/packages/common", commonDir)
    .withWorkdir("/workspace")
    .withExec(["bun", "install", "--frozen-lockfile"])
    .withWorkdir("/workspace/packages/frontend")
    .withFile("common.tgz", commonDir.file("discord-plays-pokemon-common-1.0.0.tgz"))
    .withExec(["bun", "add", "./common.tgz"])
    .withExec(["bun", "install"]);
}

/**
 * Run linting for the frontend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with linting results
 */
export async function lintFrontend(workspaceSource: Directory): Promise<Container> {
  return (await installFrontendDeps(workspaceSource)).withExec(["bun", "run", "lint:check"]);
}

/**
 * Build the frontend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with build artifacts
 */
export async function buildFrontend(workspaceSource: Directory): Promise<Container> {
  return (await installFrontendDeps(workspaceSource)).withExec(["bun", "run", "build"]);
}

/**
 * Test the frontend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with test results
 */
export async function testFrontend(workspaceSource: Directory): Promise<Container> {
  return (await installFrontendDeps(workspaceSource)).withExec(["bun", "run", "test"]);
}

/**
 * Get the frontend build artifacts
 * @param workspaceSource The full workspace source directory
 * @returns The built frontend directory
 */
export async function getFrontendBuild(workspaceSource: Directory): Promise<Directory> {
  return (await buildFrontend(workspaceSource)).directory("/workspace/packages/frontend/dist");
}
