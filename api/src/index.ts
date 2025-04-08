import Fastify, { FastifyInstance } from 'fastify';
import { VercelRequest, VercelResponse } from '@vercel/node';

import challengeRoutes from './routes/challenge';
import leaderboardRoutes from './routes/leaderboard';
import captchaRoutes from './routes/captcha';

let app: FastifyInstance | null = null;

async function buildApp() {
  if (app) return app;

  console.log("Building Fastify app instance for serverless handler...");
  const fastifyApp = Fastify({
    logger: {
      level: 'info',
    }
  });

  await fastifyApp.register(challengeRoutes, { prefix: '/challenge' });
  await fastifyApp.register(leaderboardRoutes, { prefix: '/leaderboard' });
  await fastifyApp.register(captchaRoutes, { prefix: '/captcha' });

  fastifyApp.get('/health', async () => ({ status: 'ok' }));
  fastifyApp.get('/', async () => ({ message: 'Fastify API handler root' }));


  await fastifyApp.ready();
  console.log("Fastify app instance built and ready.");
  app = fastifyApp;
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const fastifyApp = await buildApp();
    console.log(`Handling request: ${req.method} ${req.url}`);
    fastifyApp.server.emit('request', req, res);
  } catch (error) {
    console.error("Error in Vercel handler:", error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
