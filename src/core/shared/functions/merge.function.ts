export const merge = <T>(
  items: T[],
  item: T,
  where: (current: T) => boolean,
  onExisting: (current: T) => T,
  onNotFound: () => T | undefined = () => undefined,
) => {
  let wasFound = false;

  // merge the existing item if matches condition
  const result = items
    .map((p: T) => {
      if (!where(p)) return p;

      wasFound = true;

      return onExisting(p);
    })
    .filter((p) => p !== undefined) // filter out item if undefined was returned - for cases of removal
    .map((p) => {
      if (!p) throw Error('That should not happen');

      return p;
    }); // make TypeScript happy

  // if item was not found and onNotFound action is defined, try to generate new item
  if (!wasFound) {
    const result = onNotFound();

    if (result !== undefined) return [...items, item];
  }

  return result;
};
