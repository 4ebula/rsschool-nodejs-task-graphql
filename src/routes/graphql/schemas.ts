import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLEnumType,
  GraphQLNonNull,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { PrismaClient } from '@prisma/client';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

const prisma = new PrismaClient();

export const requestQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    posts: {
      type: PostsType,
      resolve: async () => await prisma.post.findMany(),
    },
    memberType: {
      type: new GraphQLList(MemberType),
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_source, { id }) => {
        console.log(id)
        if (id) {
          return await prisma.memberType.findFirst()
        }
        return await prisma.memberType.findMany();
      },
    },
  }),
});

export const PostsType = new GraphQLObjectType({
  name: 'Posts',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: 'basic'
    },
    business: {
      value: 'business'
    },
  }
});

export const MemberType = new GraphQLObjectType({
  name: 'MeberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLFloat },
  }),
});

export const schema = new GraphQLSchema({
  query: requestQueryType,
  types: [PostsType, MemberType],
});
