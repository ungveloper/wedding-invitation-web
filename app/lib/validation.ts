export const INVITATION_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{2,31}$/;

export function normalizeInvitationSlug(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidInvitationSlug(value: string): boolean {
  return INVITATION_SLUG_PATTERN.test(value);
}

export function asNonEmptyString(
  value: unknown,
  fieldName: string,
  maximumLength = 200,
): string {
  if (typeof value !== 'string') {
    throw new Error(`${fieldName} 값이 올바르지 않습니다.`);
  }

  const normalized = value.trim();

  if (!normalized || normalized.length > maximumLength) {
    throw new Error(`${fieldName} 값이 올바르지 않습니다.`);
  }

  return normalized;
}

export function asOptionalString(
  value: unknown,
  maximumLength = 1000,
): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error('문자열 값이 올바르지 않습니다.');
  }

  return value.trim().slice(0, maximumLength);
}

export function asInteger(
  value: unknown,
  fieldName: string,
  minimum: number,
  maximum: number,
): number {
  const numberValue = typeof value === 'number' ? value : Number(value);

  if (
    !Number.isInteger(numberValue) ||
    numberValue < minimum ||
    numberValue > maximum
  ) {
    throw new Error(`${fieldName} 값이 올바르지 않습니다.`);
  }

  return numberValue;
}
