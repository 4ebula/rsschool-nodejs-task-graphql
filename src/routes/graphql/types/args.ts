export interface MemberTypesArgs {
  id: MemberTypes;
}

export interface UserArgs {
  id: string;
}

export enum MemberTypes {
  Basic = 'basic',
  Business = 'business',
}
