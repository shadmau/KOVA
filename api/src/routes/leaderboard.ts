import { FastifyInstance } from 'fastify';

export default async function leaderboardRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return [
        { user: '0xabc', score: 120 },
        { user: '0xdef', score: 100 }
      ];
  });

}