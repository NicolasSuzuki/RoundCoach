import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalTokenGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const providedToken = request.headers['x-internal-token'];
    const expectedToken = this.configService.get<string>(
      'internal.apiToken',
      'roundcoach-internal-dev-token',
    );

    if (typeof providedToken !== 'string' || providedToken !== expectedToken) {
      throw new UnauthorizedException('Invalid internal token');
    }

    return true;
  }
}
