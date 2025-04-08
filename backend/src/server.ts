import Fastify, { FastifyInstance } from 'fastify';
import challengeRoutes from './routes/challenge';
import leaderboardRoutes from './routes/leaderboard';
import dotenv from 'dotenv';
dotenv.config();

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(challengeRoutes, { prefix: '/challenge' });
fastify.register(leaderboardRoutes, { prefix: '/leaderboard' });

fastify.get('/health', async () => ({ status: 'ok' }));


['SIGINT', 'SIGTERM'].forEach(signal => {
  process.once(signal, () => {
    fastify.close().then(() => {
      fastify.log.info('Server gracefully shut down');
      process.exit(0);
    });
  });
});

// Config
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`🚀 Backend running at http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();