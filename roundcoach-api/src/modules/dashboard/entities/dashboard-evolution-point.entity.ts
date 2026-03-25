import { ApiProperty } from '@nestjs/swagger';

export class DashboardEvolutionPointEntity {
  @ApiProperty()
  matchId!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  matchDate!: string;

  constructor(data: DashboardEvolutionPointEntity) {
    Object.assign(this, data);
  }
}
