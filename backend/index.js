import Fastify from 'fastify';
import routes from './src/routes/index.js';
import Knex from 'knex';
import fastifyCors from '@fastify/cors';


// Load knexfile configuration
import knexConfig from './knexfile.js';

/**
 * @type {import('fastify').FastifyInstance} Instance of Fastify
 */
const fastify = Fastify({
  logger: true,
});

// Register CORS with detailed configuration
fastify.register(fastifyCors, {
  origin: (origin, cb) => {
    const allowedOrigins = ['http://localhost:3000']; // Adjust for production
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
});

// Initialize Knex with the development configuration
const db = Knex(knexConfig.development);

// Decorate Fastify with Knex instance
fastify.decorate('knex', db);

fastify.register(routes);

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' });
    fastify.log.info(`Server is now listening on ${fastify.server.address().address}:${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
