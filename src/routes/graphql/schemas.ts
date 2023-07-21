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
  GraphQLBoolean,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { PrismaClient } from '@prisma/client';
import { MemberTypes, MemberTypesArgs, UserArgs } from './types/args.js';

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
      type: MemberType,
      args: {
        id: { type: new GraphQLNonNull(MemberTypeId) },
      },
      resolve: async (_source, { id }: MemberTypesArgs) =>
        await prisma.memberType.findFirst({
          where: { id },
        }),
    },
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async () => await prisma.memberType.findMany(),
    },
    user: {
      type: UserType,
      resolve: async (_source, { id }: UserArgs) =>
        await prisma.user.findFirst({
          where: { id },
        }),
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => await prisma.user.findMany(),
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async () => await prisma.profile.findMany(),
    },
  }),
});

const PostsType = new GraphQLObjectType({
  name: 'Posts',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: {
      value: MemberTypes.Basic,
    },
    business: {
      value: MemberTypes.Business,
    },
  },
});

const MemberType = new GraphQLObjectType({
  name: 'MeberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLFloat },
  }),
});

const UserType = new GraphQLObjectType({
  name: 'Users',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberTypeId: { type: MemberType },
  }),
});

export const schema = new GraphQLSchema({
  query: requestQueryType,
  types: [PostsType, MemberType, UserType, ProfileType],
});
