import { ValidationErrors } from './validation-errors';

export const assertNotEmptyString = (value: unknown): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(ValidationErrors.NOT_A_NONEMPTY_STRING);
  }
  return value;
};
