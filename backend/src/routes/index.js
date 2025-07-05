export default async function routes(fastify, options) {
  fastify.get('/ping', async (request, reply) => {
    return 'pong\n';
  });

  fastify.post('/send-email', async (request, reply) => {
    try {
      const { to, cc, bcc, subject, body } = request.body;
      await fastify.knex('emails').insert({
        to,
        cc,
        bcc,
        subject,
        body,
        created_at: new Date(),
      });
      return reply.status(201).send({ message: 'Email data saved' });
    } catch (error) {
      console.error('Error saving email:', error);
      return reply.status(500).send({ error: 'Failed to save email' });
    }
  });

  fastify.get('/search-emails', async (request, reply) => {
    try {
      const { query } = request.query;
      if (!query) {
        return reply.status(200).send([]);
      }

      const searchQuery = `%${query.toLowerCase()}%`;
      const emails = await fastify.knex('emails')
          .whereRaw("lower(to) like ?", [searchQuery])
          .orWhereRaw("lower(cc) like ?", [searchQuery])
          .orWhereRaw("lower(bcc) like ?", [searchQuery])
          .orWhereRaw("lower(subject) like ?", [searchQuery])
          .orWhereRaw("lower(body) like ?", [searchQuery]);

      console.log('Search query:', query, 'Results:', emails);
      return reply.status(200).send(emails);
    } catch (error) {
      console.error('Error searching emails:', error);
      return reply.status(500).send({ error: 'Failed to search emails' });
    }
  });
}
