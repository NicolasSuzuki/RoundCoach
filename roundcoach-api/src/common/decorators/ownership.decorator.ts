import { SetMetadata } from '@nestjs/common';

export type OwnershipResource = 'match' | 'vod' | 'analysis';

export interface OwnershipMetadata {
  resource: OwnershipResource;
  param: string;
}

export const OWNERSHIP_KEY = 'ownership';

export const RequireOwnership = (
  resource: OwnershipResource,
  param = 'id',
) => SetMetadata(OWNERSHIP_KEY, { resource, param } satisfies OwnershipMetadata);
