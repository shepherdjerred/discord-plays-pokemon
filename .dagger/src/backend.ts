import { Directory, Container } from "@dagger.io/dagger";
import { getNodeContainer } from "./base";
import { getCommonPackage } from "./common";

/**
 * Install dependencies for the backend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with dependencies installed
 */
export async function installBackendDeps(workspaceSource: Directory): Promise<Container> {
  // First get the common package
  const commonDir = await getCommonPackage(workspaceSource);

  return getNodeContainer()
    .withFile("/workspace/package.json", workspaceSource.file("package.json"))
    .withFile("/workspace/package-lock.json", workspaceSource.file("package-lock.json"))
    .withDirectory("/workspace/packages/backend", workspaceSource.directory("packages/backend"))
    .withDirectory("/workspace/packages/common", commonDir)
    .withWorkdir("/workspace")
    .withExec(["npm", "ci"])
    .withWorkdir("/workspace/packages/backend")
    .withFile("common.tgz", commonDir.file("discord-plays-pokemon-common-1.0.0.tgz"))
    .withExec(["npm", "install", "common.tgz"])
    .withExec(["npm", "install"]);
}

/**
 * Run linting for the backend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with linting results
 */
export async function lintBackend(workspaceSource: Directory): Promise<Container> {
  return (await installBackendDeps(workspaceSource)).withExec(["npm", "run", "lint:check"]);
}

/**
 * Build the backend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with build artifacts
 */
export async function buildBackend(workspaceSource: Directory): Promise<Container> {
  return (await installBackendDeps(workspaceSource)).withExec(["npm", "run", "build"]);
}

/**
 * Test the backend package
 * @param workspaceSource The full workspace source directory
 * @returns The container with test results
 */
export async function testBackend(workspaceSource: Directory): Promise<Container> {
  return (await installBackendDeps(workspaceSource)).withExec(["npm", "run", "test"]);
}

/**
 * Get the backend build artifacts
 * @param workspaceSource The full workspace source directory
 * @returns The built backend directory
 */
export async function getBackendBuild(workspaceSource: Directory): Promise<Directory> {
  return (await buildBackend(workspaceSource)).directory("/workspace/packages/backend/dist");
}

/**
 * Get the backend with dependencies for Docker image building
 * @param workspaceSource The full workspace source directory
 * @returns The backend directory with node_modules
 */
export async function getBackendWithDeps(workspaceSource: Directory): Promise<Directory> {
  return (await installBackendDeps(workspaceSource)).directory("/workspace/packages/backend");
}
