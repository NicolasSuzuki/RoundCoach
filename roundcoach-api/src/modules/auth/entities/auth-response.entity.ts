import { ApiProperty } from '@nestjs/swagger';
import { AuthUserEntity } from './auth-user.entity';

export class AuthResponseEntity {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: AuthUserEntity })
  user!: AuthUserEntity;

  constructor(data: {
    accessToken: string;
      user: {
        id: string;
        email: string;
        name: string;
        currentRank?: string | null;
        currentGoal?: string | null;
        mainAgents?: string[];
        mainRole?: string | null;
        currentFocus?: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
  }) {
    this.accessToken = data.accessToken;
    this.user = new AuthUserEntity(data.user);
  }
}
