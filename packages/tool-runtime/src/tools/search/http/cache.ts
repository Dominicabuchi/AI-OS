export class SearchCache<T> {

  private readonly cache =
    new Map<string,{
      expires:number;
      value:T;
    }>();

  constructor(
    private readonly ttlMs = 300000
  ) {}

  get(key:string):T|undefined{

    const entry =
      this.cache.get(key);

    if(!entry)
      return undefined;

    if(Date.now()>entry.expires){

      this.cache.delete(key);

      return undefined;

    }

    return entry.value;

  }

  set(key:string,value:T):void{

    this.cache.set(key,{
      value,
      expires:
        Date.now()+this.ttlMs
    });

  }

}
