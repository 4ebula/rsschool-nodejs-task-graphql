import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
  createGqlResponseSchema,
  gqlResponseSchema,
  schema,
} from './schemas.js';
import { graphql } from 'graphql';

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
      // console.log('Query ---> ', req.body.query);
      const res = await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        // contextValue: { prisma }
      });

      return res;
    },
  });
};

export default plugin;
