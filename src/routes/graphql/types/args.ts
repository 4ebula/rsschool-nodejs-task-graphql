import { PrismaClient } from '@prisma/client';
import { UUID } from 'node:crypto';

export enum MemberTypes {
  Basic = 'basic',
  Business = 'business',
}

export interface Context {
  prisma: PrismaClient;
}

export interface MemberTypesArgs {
  id: MemberTypes;
}

export interface ArgsWithId {
  id: string;
}

export interface ProfileData {
  dto: {
    userId: UUID;
    memberTypeId: MemberTypes;
    isMale: boolean;
    yearOfBirth: number;
  };
}

export interface PostData {
  dto: {
    authorId: UUID;
    content: UUID;
    title: UUID;
  };
}

export interface UserData {
  dto: {
    name: UUID;
    balance: number;
  };
}

export interface PostPatchData {
  id: UUID;
  dto: { title: string };
}

export interface ProfilePatchData {
  id: UUID;
  dto: { isMale: boolean };
}

export interface UserPatchData {
  id: UUID;
  dto: { name: string };
}

export interface SubsPatchData {
  userId: UUID;
  authorId: UUID;
}
