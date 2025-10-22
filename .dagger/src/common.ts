import { Directory, Container } from "@dagger.io/dagger";
import { getNodeContainer } from "./base";

/**
 * Install dependencies for the common package
 * @param workspaceSource The full workspace source directory
 * @returns The container with dependencies installed
 */
export function installCommonDeps(workspaceSource: Directory): Container {
  return getNodeContainer()
    .withFile("/workspace/package.json", workspaceSource.file("package.json"))
    .withFile("/workspace/package-lock.json", workspaceSource.file("package-lock.json"))
    .withDirectory("/workspace/packages/common", workspaceSource.directory("packages/common"))
    .withWorkdir("/workspace")
    .withExec(["npm", "ci"])
    .withWorkdir("/workspace/packages/common")
    .withExec(["npm", "install"]);
}

/**
 * Run linting for the common package
 * @param workspaceSource The full workspace source directory
 * @returns The container with linting results
 */
export function lintCommon(workspaceSource: Directory): Container {
  return installCommonDeps(workspaceSource).withExec(["npm", "run", "lint:check"]);
}

/**
 * Build the common package
 * @param workspaceSource The full workspace source directory
 * @returns The container with build artifacts
 */
export function buildCommon(workspaceSource: Directory): Container {
  return installCommonDeps(workspaceSource).withExec(["npm", "run", "build"]);
}

/**
 * Test the common package
 * @param workspaceSource The full workspace source directory
 * @returns The container with test results
 */
export function testCommon(workspaceSource: Directory): Container {
  return installCommonDeps(workspaceSource).withExec(["npm", "run", "test"]);
}

/**
 * Pack the common package for use in other packages
 * @param workspaceSource The full workspace source directory
 * @returns The built and packed package
 */
export function packCommon(workspaceSource: Directory): Container {
  return buildCommon(workspaceSource).withExec(["npm", "pack"]);
}

/**
 * Get the packed common package artifact
 * @param workspaceSource The full workspace source directory
 * @returns The packed tarball file
 */
export async function getCommonPackage(workspaceSource: Directory): Promise<Directory> {
  return packCommon(workspaceSource).directory("/workspace/packages/common");
}
