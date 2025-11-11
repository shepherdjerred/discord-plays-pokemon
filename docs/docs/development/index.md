# Development

## Requirements

- [NodeJS LTS (18.x)](https://nodejs.org/en)
- [Dagger](https://docs.dagger.io/install)
- [Docker](https://www.docker.com/products/docker-desktop/)

## Structure

This project is structured as follows:

```text
docs/
packages/
├─ backend/
├─ common/
├─ frontend/
```

## Using Dagger

You can build the source code by running `dagger call build --source=.`. This will build the frontend, backend, and common components. A Docker image can be created by running `dagger call build-image --source=.`.

!!! note

    Dagger automatically handles dependencies, caching, and parallelization for optimal build performance.

To run the full CI pipeline locally, use `dagger call ci --source=. --version=dev --git-sha=$(git rev-parse HEAD) --env=dev`.

Available Dagger functions can be viewed by running `dagger functions`.

## Without Dagger

Sometimes it is useful to not be working with a container. In this case, you can build the project directly on your machine.

1. Run `npm i` in the root the repository
2. Run `npm run build --workspaces`

## Testing Changes

Manually testing changes can be achieved by running the application. It is easiest to do this if you first edit your `config.toml` to disable features that require a GPU or web browser, if possible.
