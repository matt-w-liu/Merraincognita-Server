export const BCRYPT_ROUNDS = 12;
export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
export const PASSWORD_RESET_EXPIRES_MS = 60 * 60 * 1000;

// Source of truth: company information supplied directly by MERRAINCOGNITA LLC.
// No charter/registration number, EIN, formation date, or phone number has been supplied — do not
// invent these.
export const COMPANY = {
  name: 'MERRAINCOGNITA LLC',
  ceo: 'Akhtar Jan',
  supportEmail: 'support@merraincognita.com',
  address: {
    street: '1640 Bird Holw',
    city: 'Austin',
    region: 'TX',
    postalCode: '78737',
    country: 'United States of America',
  },
  url: 'https://merraincognita.com',
  jurisdiction: 'Texas',
} as const;
