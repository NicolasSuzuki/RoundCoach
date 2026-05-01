import { ApiProperty } from '@nestjs/swagger';

export class AuthUserEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  currentRank?: string | null;

  @ApiProperty({ required: false, nullable: true })
  targetRank?: string | null;

  @ApiProperty({ required: false, nullable: true })
  currentGoal?: string | null;

  @ApiProperty({ type: String, isArray: true })
  mainAgents!: string[];

  @ApiProperty({ required: false, nullable: true })
  mainRole?: string | null;

  @ApiProperty({ required: false, nullable: true })
  currentFocus?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(data: {
      id: string;
      email: string;
      name: string;
      currentRank?: string | null;
      targetRank?: string | null;
      currentGoal?: string | null;
      mainAgents?: string[];
      mainRole?: string | null;
      currentFocus?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.currentRank = data.currentRank ?? null;
    this.targetRank = data.targetRank ?? null;
    this.currentGoal = data.currentGoal ?? null;
    this.mainAgents = data.mainAgents ?? [];
    this.mainRole = data.mainRole ?? null;
    this.currentFocus = data.currentFocus ?? null;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
