import { SearchResult } from "../index";

export class ResultNormalizer {

  normalize(
    provider:string,
    results:any[]
  ):SearchResult[]{

    return results.map(result=>({

      title:
        result.title ??
        result.name ??
        "",

      url:
        result.url ??
        result.link ??
        "",

      snippet:
        result.snippet ??
        result.description ??
        "",

      source:provider,

      metadata:result

    }));

  }

}
