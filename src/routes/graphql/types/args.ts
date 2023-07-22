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
