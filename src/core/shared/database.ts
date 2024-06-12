export interface DocumentsCollection<T> {
  store: (id: string, obj: T) => void;
  delete: (id: string) => void;
  get: (id: string) => T | null;
}

export interface Database {
  collection: <T>(name: string) => DocumentsCollection<T>;
}
