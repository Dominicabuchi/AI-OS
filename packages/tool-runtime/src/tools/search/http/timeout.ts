export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 30000
): Promise<T> {

  return Promise.race([

    promise,

    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(
          new Error("Request timed out.")
        ),
        timeoutMs
      )
    )

  ]);

}
