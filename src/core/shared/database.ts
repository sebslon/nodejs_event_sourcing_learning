export type StoreOptions = {
  externalVersion: number;
};

export interface DocumentsCollection<T> {
  store: (id: string, obj: T, options?: StoreOptions) => boolean;
  delete: (id: string) => boolean;
  get: (id: string) => T | null;
}

export type DocumentEnvelope = {
  document: unknown;
  version: number;
  validFrom: Date;
};

export interface Database {
  collection: <T>(name: string) => DocumentsCollection<T>;
}
