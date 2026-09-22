process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.CLIENT_URL = 'http://localhost:5173';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/merraincognita-test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-32-characters!!';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-characters!';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
process.env.PASSWORD_RESET_URL = 'http://localhost:5173/reset-password';
process.env.CONTACT_TO_EMAIL = 'support@merraincognita.com';
process.env.SMTP_FROM_NAME = 'MERRAINCOGNITA LLC';
// Force the jsonTransport (no network) fallback in tests, regardless of any real
// SMTP credentials present in a developer's local .env — dotenv.config() does not
// override keys that already exist in process.env, so setting these (even to '')
// here wins over whatever is in .env and keeps the suite fast and deterministic.
process.env.SMTP_HOST = '';
process.env.SMTP_USER = '';
process.env.SMTP_PASS = '';
process.env.RATE_LIMIT_MAX = '1000';
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.CONTACT_RATE_LIMIT_MAX = '1000';
