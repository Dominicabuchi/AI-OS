import { ApiResponseError } from "twitter-api-v2";

export class XTransport {

  static async execute<T>(
    api: () => Promise<T>,
    browser: () => Promise<T>,
  ): Promise<T> {

    try {
      return await api();

    } catch (error: any) {

      if (
        error instanceof ApiResponseError &&
        (
          error.code === 402 ||
          error.code === 403 ||
          error.code === 404 ||
          error.code === 429
        )
      ) {
        console.log(
          `[XTransport] Falling back to browser (${error.code})`
        );

        return browser();
      }

      throw error;
    }
  }

}
