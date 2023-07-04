import lodash from "lodash";

export function wait(wait: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), wait);
  });
}

export function randomId(): string {
  return lodash.random(Number.MAX_VALUE).toString();
}
