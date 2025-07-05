// ESM
import Fastify from 'fastify';
import routes from './src/routes/index.js';
import knex from 'knex';

// Load knexfile configuration
import knexConfig from './knexfile.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true
});

// Initialize Knex with the development configuration
const db = knex(knexConfig.development);

// Decorate Fastify with Knex instance
fastify.decorate('knex', db);

fastify.register(routes);

fastify.listen({ port: process.env.PORT }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is now listening on ${address}`);
});
