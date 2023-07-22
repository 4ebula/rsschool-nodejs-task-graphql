import { GraphQLEnumType } from 'graphql';
import {
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../types/uuid.js';
import { MemberTypes, ArgsWithId } from '../types/args.js';

const prisma = new PrismaClient();

export const MemberTypeId = new GraphQLEnumType({
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

export const PostType = new GraphQLObjectType({
  name: 'Posts',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
});

export const MemberType = new GraphQLObjectType({
  name: 'MeberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLFloat },
  }),
});

export const UserType: GraphQLObjectType = new GraphQLObjectType({
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
      type: new GraphQLList(PostType),
      resolve: async ({ id: authorId }: ArgsWithId) =>
        await prisma.post.findMany({
          where: { authorId },
        }),
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

export const ProfileType = new GraphQLObjectType({
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

export const SubscriberType = new GraphQLObjectType({
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
