import { UUID } from 'node:crypto';

export enum MemberTypes {
  Basic = 'basic',
  Business = 'business',
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
