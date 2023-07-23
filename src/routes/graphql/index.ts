import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  schema,
} from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit  from 'graphql-depth-limit';


const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const errors = validate(schema, parse(req.body.query), [depthLimit(5)]);

      if (errors.length) {
        return { errors };
      }

      const res = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        contextValue: { prisma: fastify.prisma },
      });

      return res;
    },
  });
};

export default plugin;
