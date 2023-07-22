import { Type } from '@fastify/type-provider-typebox';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFloat,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
} from 'graphql';
import { UUIDType } from './types/uuid.js';
import { PrismaClient } from '@prisma/client';
import {
  MemberTypes,
  MemberTypesArgs,
  ArgsWithId,
  ProfileData,
  PostData,
  UserData,
  UserPatchData,
  ProfilePatchData,
  PostPatchData,
  SubsPatchData,
} from './types/args.js';
import {
  MemberTypeId,
  CreateProfileInput,
  CreatePostInput,
  CreateUserInput,
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
} from './types/mutations.js';

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

const PostType = new GraphQLObjectType({
  name: 'Posts',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
  }),
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
      type: new GraphQLList(PostType),
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

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createProfile: {
      type: ProfileType,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_source, data: ProfileData) => {
        const { dto } = data;
        return await prisma.profile.create({ data: { ...dto } });
      },
    },
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_source, data: PostData) => {
        const { dto } = data;
        return await prisma.post.create({ data: { ...dto } });
      },
    },
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_source, data: UserData) => {
        const { dto } = data;
        return await prisma.user.create({ data: { ...dto } });
      },
    },
    deletePost: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId) => {
        await prisma.post.delete({
          where: { id },
        });
        return id;
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId) => {
        await prisma.profile.delete({
          where: { id },
        });
        return id;
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId) => {
        await prisma.user.delete({
          where: { id },
        });
        return id;
      },
    },
    changePost: {
      type: PostType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangePostInput) },
      },
      resolve: async (_source, { id, dto: { title } }: PostPatchData) =>
        await prisma.post.update({
          where: { id },
          data: { title },
        }),
    },
    changeProfile: {
      type: ProfileType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeProfileInput) },
      },
      resolve: async (_source, { id, dto: { isMale } }: ProfilePatchData) =>
        await prisma.profile.update({
          where: { id },
          data: { isMale },
        }),
    },
    changeUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(UUIDType) },
        dto: { type: new GraphQLNonNull(ChangeUserInput) },
      },
      resolve: async (_source, { id, dto: { name } }: UserPatchData) =>
        await prisma.user.update({
          where: { id },
          data: { name },
        }),
    },
    subscribeTo: {
      type: new GraphQLList(UserType),
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { userId: subscriberId, authorId }: SubsPatchData) => {
        await prisma.subscribersOnAuthors.create({
          data: {
            subscriberId,
            authorId,
          },
        });

        return Promise.all(
          [subscriberId, authorId].map((id) =>
            prisma.user.findFirst({
              where: { id },
            }),
          ),
        );
      },
    },
    unsubscribeFrom: {
      type: GraphQLString,
      args: {
        userId: { type: new GraphQLNonNull(UUIDType) },
        authorId: { type: new GraphQLNonNull(UUIDType) },
      },
      resolve: async (_source, { userId: subscriberId, authorId }: SubsPatchData) => {
        await prisma.subscribersOnAuthors.deleteMany({
          where: { AND: [{ subscriberId }, { authorId }] },
        });

        return subscriberId;
        // return [];
      },
    },
  }),
});

export const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
  types: [
    PostType,
    MemberType,
    UserType,
    ProfileType,
    SubscriberType,
    CreateProfileInput,
  ],
});
