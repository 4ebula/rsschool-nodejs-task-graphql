import { GraphQLObjectType, GraphQLList, GraphQLString, GraphQLNonNull } from 'graphql';
import { UUIDType } from '../types/uuid.js';
import {
  ArgsWithId,
  ProfileData,
  PostData,
  UserData,
  UserPatchData,
  ProfilePatchData,
  PostPatchData,
  SubsPatchData,
  Context,
} from '../types/args.js';
import { PostType, ProfileType, UserType } from '../queries/query.types.js';
import {
  CreateProfileInput,
  CreatePostInput,
  CreateUserInput,
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
} from './mutation.types.js';

export const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    createProfile: {
      type: ProfileType,
      args: { dto: { type: new GraphQLNonNull(CreateProfileInput) } },
      resolve: async (_source, data: ProfileData, { prisma }: Context) => {
        const { dto } = data;
        return await prisma.profile.create({ data: { ...dto } });
      },
    },
    createPost: {
      type: PostType,
      args: { dto: { type: new GraphQLNonNull(CreatePostInput) } },
      resolve: async (_source, data: PostData, { prisma }: Context) => {
        const { dto } = data;
        return await prisma.post.create({ data: { ...dto } });
      },
    },
    createUser: {
      type: UserType,
      args: { dto: { type: new GraphQLNonNull(CreateUserInput) } },
      resolve: async (_source, data: UserData, { prisma }: Context) => {
        const { dto } = data;
        return await prisma.user.create({ data: { ...dto } });
      },
    },
    deletePost: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId, { prisma }: Context) => {
        await prisma.post.delete({
          where: { id },
        });
        return id;
      },
    },
    deleteProfile: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId, { prisma }: Context) => {
        await prisma.profile.delete({
          where: { id },
        });
        return id;
      },
    },
    deleteUser: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_source, { id }: ArgsWithId, { prisma }: Context) => {
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
      resolve: async (
        _source,
        { id, dto: { title } }: PostPatchData,
        { prisma }: Context,
      ) =>
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
      resolve: async (
        _source,
        { id, dto: { isMale } }: ProfilePatchData,
        { prisma }: Context,
      ) =>
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
      resolve: async (
        _source,
        { id, dto: { name } }: UserPatchData,
        { prisma }: Context,
      ) =>
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
      resolve: async (
        _source,
        { userId: subscriberId, authorId }: SubsPatchData,
        { prisma }: Context,
      ) => {
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
      resolve: async (
        _source,
        { userId: subscriberId, authorId }: SubsPatchData,
        { prisma }: Context,
      ) => {
        await prisma.subscribersOnAuthors.deleteMany({
          where: { AND: [{ subscriberId }, { authorId }] },
        });

        return subscriberId;
      },
    },
  }),
});