export function wait(wait: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), wait);
  });
}
