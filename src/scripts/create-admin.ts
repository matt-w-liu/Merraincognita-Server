/**
 * Secure administrator creation CLI.
 *
 * Usage:
 *   npm run create-admin -- --email=admin@example.com
 *   ADMIN_PASSWORD=... npm run create-admin -- --email=admin@example.com
 *
 * Never hardcode administrator passwords.
 */
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/token.service.js';
import { normalizeEmail } from '../utils/crypto.js';
import { passwordSchema } from '@merraincognita/shared';

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : undefined;
}

async function prompt(question: string, hidden = false): Promise<string> {
  if (!hidden) {
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(question);
    rl.close();
    return answer.trim();
  }

  // Simple hidden prompt for terminals that support it
  output.write(question);
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (stdin.isTTY) stdin.setRawMode(true);
    let value = '';
    const onData = (char: Buffer) => {
      const c = char.toString('utf8');
      if (c === '\n' || c === '\r' || c === '\u0004') {
        stdin.removeListener('data', onData);
        if (stdin.isTTY) stdin.setRawMode(wasRaw ?? false);
        output.write('\n');
        resolve(value.trim());
        return;
      }
      if (c === '\u0003') {
        process.exit(1);
      }
      if (c === '\u007f' || c === '\b') {
        value = value.slice(0, -1);
        return;
      }
      value += c;
      output.write('*');
    };
    stdin.on('data', onData);
  });
}

async function main() {
  let email = getArg('email') || process.env.ADMIN_EMAIL;
  let password = process.env.ADMIN_PASSWORD;
  let name = getArg('name') || process.env.ADMIN_NAME || 'Administrator';

  if (!email) {
    email = await prompt('Admin email: ');
  }
  email = normalizeEmail(email);
  if (!email.includes('@')) {
    throw new Error('A valid email is required');
  }

  if (!password) {
    password = await prompt('Admin password: ', true);
    const confirm = await prompt('Confirm password: ', true);
    if (password !== confirm) {
      throw new Error('Passwords do not match');
    }
  }

  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join('; '));
  }

  await connectDatabase();

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role === 'admin') {
      console.info(`[create-admin] User ${email} is already an administrator.`);
      await disconnectDatabase();
      return;
    }
    existing.role = 'admin';
    existing.status = 'active';
    existing.passwordHash = await hashPassword(password);
    existing.passwordChangedAt = new Date();
    existing.refreshTokens = [];
    await existing.save();
    console.info(`[create-admin] Elevated existing user ${email} to administrator.`);
  } else {
    await User.create({
      name,
      email,
      passwordHash: await hashPassword(password),
      role: 'admin',
      status: 'active',
      emailVerified: true,
    });
    console.info(`[create-admin] Created administrator ${email}`);
  }

  await disconnectDatabase();
}

main().catch(async (error) => {
  console.error('[create-admin] Failed:', error instanceof Error ? error.message : error);
  await disconnectDatabase().catch(() => undefined);
  process.exit(1);
});
