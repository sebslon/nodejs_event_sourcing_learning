import { ValidationErrors } from './validation-errors';

export const assertUnsignedBigInt = (value: string): bigint => {
  const number = BigInt(value);
  if (number < 0) {
    throw new Error(ValidationErrors.NOT_AN_UNSIGNED_BIGINT);
  }
  return number;
};
