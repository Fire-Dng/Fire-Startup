/**
 * Centralized Currency & Price Validator + Formatter for Web CMS
 * Reused across all tables, dashboard KPIs, charts, BOM breakdowns, and NumberInputs.
 */

export interface CurrencyValidationResult {
  isValid: boolean;
  value: number;
  message?: string;
}

export interface CurrencyValidationOptions {
  min?: number;
  max?: number;
  allowZero?: boolean;
  step?: number;
  fieldName?: string;
  locale?: 'vi' | 'en';
}

/**
 * Formats a numeric amount into standard Vietnamese Dong (VNĐ), e.g., `320.000đ`
 */
export function formatVnd(amount?: number | string | null): string {
  const numeric = typeof amount === 'string' ? parseCurrencyInput(amount) : Number(amount ?? 0);
  const safeValue = Number.isFinite(numeric) ? Math.round(numeric) : 0;
  return `${safeValue.toLocaleString('vi-VN')}đ`;
}

/**
 * Formats a numeric amount without the `đ` symbol for use inside NumberInput (`formatValue`),
 * where `units="VNĐ"` is already displayed by Astryx NumberInput.
 */
export function formatNumberInputVnd(amount?: number | null): string {
  const safeValue = Number.isFinite(Number(amount)) ? Math.round(Number(amount)) : 0;
  return safeValue.toLocaleString('vi-VN');
}

/**
 * Formats large currency figures into compact form for chart axes & KPI sub-labels (e.g., `18,5tr`, `450k`)
 */
export function formatCompactVnd(amount?: number | null, locale: 'vi' | 'en' = 'vi'): string {
  const safe = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  if (Math.abs(safe) >= 1_000_000) {
    const millions = (safe / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return locale === 'en' ? `${millions}M ₫` : `${millions}tr đ`;
  }
  if (Math.abs(safe) >= 1_000) {
    const thousands = Math.round(safe / 1_000);
    return `${thousands}k đ`;
  }
  return `${safe}đ`;
}

/**
 * Parses a raw user-typed or pasted currency string (`"320.000 đ"`, `"320,000"`) into a clean number
 */
export function parseCurrencyInput(raw: string | number | null | undefined): number {
  if (typeof raw === 'number') {
    return Number.isFinite(raw) ? Math.round(raw) : 0;
  }
  const cleaned = String(raw || '').replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Validates a currency amount against min/max/zero rules and returns an Astryx-compatible validation result
 */
export function validateCurrencyAmount(
  rawAmount: number | string | null | undefined,
  options: CurrencyValidationOptions = {}
): CurrencyValidationResult {
  const {
    min = 0,
    max = 500_000_000,
    allowZero = true,
    fieldName = 'Số tiền',
    locale = 'vi',
  } = options;

  const isEn = locale === 'en';
  const value = parseCurrencyInput(rawAmount);

  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      value: 0,
      message: isEn ? `${fieldName} must be a valid number.` : `${fieldName} phải là số hợp lệ.`,
    };
  }

  if (!allowZero && value <= 0) {
    return {
      isValid: false,
      value,
      message: isEn ? `${fieldName} must be greater than 0đ.` : `${fieldName} phải lớn hơn 0đ.`,
    };
  }

  if (value < min) {
    return {
      isValid: false,
      value,
      message: isEn
        ? `${fieldName} cannot be less than ${formatVnd(min)}.`
        : `${fieldName} tối thiểu là ${formatVnd(min)}.`,
    };
  }

  if (value > max) {
    return {
      isValid: false,
      value,
      message: isEn
        ? `${fieldName} cannot exceed ${formatVnd(max)}.`
        : `${fieldName} không được vượt quá ${formatVnd(max)}.`,
    };
  }

  return {
    isValid: true,
    value,
  };
}
