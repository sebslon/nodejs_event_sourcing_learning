// Handle Eventual Consistency with retries

import { DocumentsCollection } from "../database";

type RetryOptions = {
  maxRetries: number;
  delay: number;
}

const defaultRetryOptions: RetryOptions = {
  maxRetries: 5,
  delay: 10,
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type RetryResult<T> = { shouldRetry: true } | { shouldRetry: false; result: T };

const retryAgain = <T>(): RetryResult<T> => ({ shouldRetry: true });
const ok = <T>(result: T): RetryResult<T> => ({ shouldRetry: false, result });

const retry = async <T>(
  handle: () => RetryResult<T>,
  { delay, maxRetries }: RetryOptions = defaultRetryOptions,
): Promise<T | undefined> => {
  let currentDelay = delay;
  let retries = 0;

  do {
    const handleResult = handle();

    if (!handleResult.shouldRetry) {
      return handleResult.result;
    }

    await sleep(currentDelay);
    
    retries++;
    currentDelay += delay;
  } while (retries < maxRetries);

  return undefined;
};

// PUBLIC API //
type VersionedDocument = {
  lastProcessedPosition: number;
};

const getWithRetries = async <T extends VersionedDocument>(
  collection: DocumentsCollection<T>,
  id: string,
  streamPosition: number,
) => {
  return retry((): RetryResult<{ isNewer: boolean; document: T }> => {
    const document = collection.get(id);

    if (document && document.lastProcessedPosition >= streamPosition) {
      return ok({ isNewer: true, document });
    }

    if (document && document.lastProcessedPosition == streamPosition - 1) {
      return ok({ isNewer: false, document });
    }

    return retryAgain();
  });
};

const storeWithRetries = async <T extends VersionedDocument>(
  collection: DocumentsCollection<T>,
  id: string,
  document: T,
  streamPosition: number,
) => {
  return retry(() => {
    const updated = collection.store(id, document, {
      externalVersion: streamPosition,
    });

    return updated ? ok(true) : retryAgain();
  });
};

const deleteWithRetries = async <T extends VersionedDocument>(
  collection: DocumentsCollection<T>,
  id: string,
) => {
  return retry(() => {
    const updated = collection.delete(id);

    return updated ? ok(true) : retryAgain();
  });
};

export { VersionedDocument, deleteWithRetries, getWithRetries, storeWithRetries };

