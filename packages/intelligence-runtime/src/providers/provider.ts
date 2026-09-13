import {
  IntelligenceRequest
} from "../types";

export interface ProviderResult<T = unknown> {

  id: string;

  data: T;

}

export interface IntelligenceProvider<
  T = unknown
> {

  readonly id: string;

  collect(
    request: IntelligenceRequest
  ): Promise<T>;

}
