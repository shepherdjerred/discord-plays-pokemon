export function delay(milliseconds: number): Promise<void> {
  return new Promise(function (resolve) {
    setTimeout(resolve, milliseconds);
  });
}
