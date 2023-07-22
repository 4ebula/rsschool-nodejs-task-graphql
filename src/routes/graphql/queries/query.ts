import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import { PrismaClient } from '@prisma/client';
import { UUIDType } from '../types/uuid.js';
import { MemberTypesArgs, ArgsWithId } from '../types/args.js';
import {
  MemberType,
  MemberTypeId,
  PostType,
  ProfileType,
  UserType,
} from './query.types.js';

const prisma = new PrismaClient();

export const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    post: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { id }: ArgsWithId) =>
        await prisma.post.findFirst({
          where: { id },
        }),
    },
    posts: {
      type: new GraphQLList(PostType),
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
