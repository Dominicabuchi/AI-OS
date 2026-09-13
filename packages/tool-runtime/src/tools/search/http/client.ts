export interface HttpRequest {
  url: string;
  method?: string;
  headers?: Record<string,string>;
  body?: unknown;
}

export class SearchHttpClient {

  async request<T = unknown>(
    request: HttpRequest
  ): Promise<T> {

    const response = await fetch(request.url,{
      method: request.method ?? "GET",
      headers:{
        "Content-Type":"application/json",
        ...(request.headers ?? {})
      },
      body:
        request.body
          ? JSON.stringify(request.body)
          : undefined
    });

    if(!response.ok){

      throw new Error(
        `${response.status} ${response.statusText}`
      );

    }

    return response.json();

  }

}
