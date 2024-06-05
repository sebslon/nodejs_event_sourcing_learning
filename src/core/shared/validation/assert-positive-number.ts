import { ValidationErrors } from './validation-errors';

export const assertPositiveNumber = (value: unknown): number => {
  if (typeof value !== 'number' || value <= 0) {
    throw new Error(ValidationErrors.NOT_A_POSITIVE_NUMBER);
  }
  return value;
};
