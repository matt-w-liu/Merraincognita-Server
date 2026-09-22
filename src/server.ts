import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.info(`[server] MERRAINCOGNITA API listening on port ${env.PORT}`);
    console.info(`[server] Environment: ${env.NODE_ENV}`);
    console.info(`[server] Client URL(s): ${env.CLIENT_URL.join(', ')}`);
  });
}

bootstrap().catch((error) => {
  console.error('[server] Failed to start:', error);
  process.exit(1);
});
