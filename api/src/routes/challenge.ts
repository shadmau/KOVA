import { FastifyInstance } from 'fastify';

export default async function challengeRoutes(fastify: FastifyInstance) {
  fastify.post('/start', async (request, reply) => {
    return { status: 'started', challengeId: '123' };
  });

  fastify.get('/:id/status', async (request, reply) => {
    return { status: 'running' };
  });

  fastify.get('/:id/result', async (request, reply) => {
    return { status: 'completed', result: 'success' };
  });
}