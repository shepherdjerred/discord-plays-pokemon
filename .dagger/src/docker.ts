import { Directory, Container, Secret, dag } from "@dagger.io/dagger";
import { getBackendWithDeps } from "./backend";
import { getFrontendBuild } from "./frontend";

/**
 * Build the Discord Plays Pokemon Docker image
 * @param workspaceSource The full workspace source directory
 * @param version The version tag
 * @param gitSha The git SHA
 * @returns The built container
 */
export async function buildDockerImage(
  workspaceSource: Directory,
  version: string,
  gitSha: string,
): Promise<Container> {
  // Get the built backend and frontend
  const backendDir = await getBackendWithDeps(workspaceSource);
  const frontendDist = await getFrontendBuild(workspaceSource);

  return dag
    .container()
    .from("ghcr.io/selkies-project/nvidia-egl-desktop:24.04-20241222100454")
    .withEnvVariable("DEBIAN_FRONTEND", "noninteractive")
    .withUser("root")
    .withExec(["apt", "update"])
    .withExec(["apt", "install", "-y", "curl", "kde-config-screenlocker"])
    .withExec(["curl", "-sL", "https://deb.nodesource.com/setup_lts.x", "-o", "/tmp/nodesource_setup.sh"])
    .withExec(["bash", "/tmp/nodesource_setup.sh"])
    .withExec(["apt", "install", "-y", "nodejs"])
    .withWorkdir("/home/ubuntu")
    .withExec(["mkdir", "-p", "data"])
    .withUser("ubuntu")
    .withExec(["kwriteconfig5", "--file", "kscreenlockerrc", "--group", "Daemon", "--key", "Autolock", "false"])
    .withExec([
      "kwriteconfig5",
      "--file",
      "~/.config/powermanagementprofilesrc",
      "--group",
      "AC",
      "--group",
      "DPMSControl",
      "--key",
      "idleTime",
      "540",
    ])
    .withFile("package.json", backendDir.file("package.json"))
    .withFile("package-lock.json", backendDir.file("package-lock.json"))
    .withDirectory("packages/backend", backendDir)
    .withDirectory("packages/frontend", frontendDist)
    .withFile("run.sh", workspaceSource.file("misc/run.sh"))
    .withFile("supervisord.conf", workspaceSource.file("misc/supervisord.conf"))
    .withExec(["sh", "-c", "cat supervisord.conf | sudo tee -a /etc/supervisord.conf"])
    .withExec(["rm", "supervisord.conf"])
    .withExec(["mkdir", "Downloads"])
    .withExec(["sudo", "chown", "-R", "ubuntu:ubuntu", "Downloads"])
    .withLabel("org.opencontainers.image.title", "discord-plays-pokemon")
    .withLabel(
      "org.opencontainers.image.description",
      "Discord Plays Pokemon - A bot that lets Discord users play Pokemon",
    )
    .withLabel("org.opencontainers.image.version", version)
    .withLabel("org.opencontainers.image.revision", gitSha);
}

/**
 * Publish the Docker image to GitHub Container Registry
 * @param workspaceSource The full workspace source directory
 * @param version The version tag
 * @param gitSha The git SHA
 * @param registryUsername Optional registry username for authentication
 * @param registryPassword Optional registry password for authentication
 * @returns The published image references
 */
export async function publishDockerImage(
  workspaceSource: Directory,
  version: string,
  gitSha: string,
  registryUsername?: string,
  registryPassword?: Secret,
): Promise<string[]> {
  let image = await buildDockerImage(workspaceSource, version, gitSha);

  // Set up registry authentication if credentials provided
  if (registryUsername && registryPassword) {
    image = image.withRegistryAuth("ghcr.io", registryUsername, registryPassword);
  }

  const versionRef = await image.publish(`ghcr.io/shepherdjerred/discord-plays-pokemon:${version}`);
  const latestRef = await image.publish(`ghcr.io/shepherdjerred/discord-plays-pokemon:latest`);

  return [versionRef, latestRef];
}
