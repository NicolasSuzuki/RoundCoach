import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../database/prisma/prisma.service';
import {
  OWNERSHIP_KEY,
  OwnershipMetadata,
} from '../decorators/ownership.decorator';
import { AuthenticatedUser } from '../types/authenticated-user.type';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<OwnershipMetadata>(
      OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!metadata) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      params: Record<string, string | undefined>;
      user?: AuthenticatedUser;
    }>();

    const resourceId = request.params?.[metadata.param];

    if (!resourceId || !request.user) {
      return true;
    }

    const ownerId = await this.resolveOwnerId(metadata, resourceId);

    if (!ownerId) {
      throw new NotFoundException(
        `${metadata.resource.charAt(0).toUpperCase()}${metadata.resource.slice(1)} not found`,
      );
    }

    if (ownerId !== request.user.id) {
      throw new ForbiddenException(
        `You do not have access to this ${metadata.resource}`,
      );
    }

    return true;
  }

  private async resolveOwnerId(
    metadata: OwnershipMetadata,
    resourceId: string,
  ): Promise<string | null> {
    switch (metadata.resource) {
      case 'match': {
        const match = await this.prisma.match.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });

        return match?.userId ?? null;
      }

      case 'vod': {
        const vod = await this.prisma.vod.findUnique({
          where: { id: resourceId },
          select: { userId: true },
        });

        return vod?.userId ?? null;
      }

      case 'analysis': {
        const analysis = await this.prisma.analysis.findUnique({
          where: { id: resourceId },
          select: {
            match: {
              select: {
                userId: true,
              },
            },
          },
        });

        return analysis?.match.userId ?? null;
      }
    }
  }
}
