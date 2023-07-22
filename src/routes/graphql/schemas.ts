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
import { MemberTypes, MemberTypesArgs, ArgsWithId } from './types/args.js';

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
    post: {
      type: PostsType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: ArgsWithId) =>
        await prisma.post.findFirst({
          where: { id },
        }),
    },
    posts: {
      type: new GraphQLList(PostsType),
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
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: ArgsWithId) =>
        await prisma.user.findFirst({
          where: { id },
        }),
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => await prisma.user.findMany(),
    },
    profile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: ArgsWithId) =>
        await prisma.profile.findFirst({
          where: { id },
        }),
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
    [MemberTypes.Basic]: {
      value: MemberTypes.Basic,
    },
    [MemberTypes.Business]: {
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

const UserType: GraphQLObjectType = new GraphQLObjectType({
  name: 'Users',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: async ({ id: userId }: ArgsWithId) =>
        await prisma.profile.findFirst({
          where: { userId },
        }),
    },
    posts: {
      type: new GraphQLList(PostsType),
      resolve: async ({ id: authorId }: ArgsWithId) => {
        return await prisma.post.findMany({
          where: { authorId },
        });
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async ({ id: subscriberId }: ArgsWithId) => {
        const subs = await prisma.subscribersOnAuthors.findMany({
          where: { subscriberId },
        });
        const subAuthorsIds = subs.map((sub) => sub.authorId);

        return Promise.all(
          subAuthorsIds.map((authorId) =>
            prisma.user.findFirst({
              where: { id: authorId },
            }),
          ),
        );
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async ({ id: authorId }: ArgsWithId) => {
        const subs = await prisma.subscribersOnAuthors.findMany({
          where: { authorId },
        });
        const subIds = subs.map((sub) => sub.subscriberId);

        return Promise.all(
          subIds.map((subscriberId) =>
            prisma.user.findFirst({
              where: { id: subscriberId },
            }),
          ),
        );
      },
    },
  }),
});

const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    memberType: {
      type: MemberType,
      resolve: async ({ memberTypeId: id }: { memberTypeId: MemberTypes }) =>
        await prisma.memberType.findFirst({
          where: { id },
        }),
    },
    memberTypeId: { type: MemberTypeId },
  }),
});

const SubscriberType = new GraphQLObjectType({
  name: 'Subscriber',
  fields: () => ({
    subscriber: { type: UserType },
    subscriberId: { type: new GraphQLNonNull(UUIDType) },
    author: { type: UserType },
    authorId: { type: new GraphQLNonNull(UUIDType) },
    subscribedToUser: { type: new GraphQLList(UserType) },
    userSubscribedTo: { type: new GraphQLList(UserType) },
  }),
});

export const schema = new GraphQLSchema({
  query: requestQueryType,
  types: [PostsType, MemberType, UserType, ProfileType, SubscriberType],
});
