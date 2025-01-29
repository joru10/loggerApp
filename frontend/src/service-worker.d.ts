interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<any>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
  mode?: string;
}

interface ServiceWorkerGlobalScope {
  clients: Clients;
  registration: ServiceWorkerRegistration;
  addEventListener(type: string, listener: EventListener): void;
  skipWaiting(): Promise<void>;
  caches: CacheStorage;
}

interface Clients {
  claim(): Promise<void>;
}

declare var self: ServiceWorkerGlobalScope;

interface CacheStorage {
  open(cacheName: string): Promise<Cache>;
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
  match(request: RequestInfo): Promise<Response | undefined>;
}

interface Cache {
  add(request: RequestInfo): Promise<void>;
  put(request: RequestInfo, response: Response): Promise<void>;
  match(request: RequestInfo): Promise<Response | undefined>;
  delete(request: RequestInfo, options?: CacheQueryOptions): Promise<boolean>;
}

interface CacheQueryOptions {
  ignoreSearch?: boolean;
  ignoreMethod?: boolean;
  ignoreVary?: boolean;
  cacheName?: string;
}