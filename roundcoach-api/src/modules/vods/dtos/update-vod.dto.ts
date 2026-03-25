import { PartialType } from '@nestjs/swagger';
import { CreateVodDto } from './create-vod.dto';

export class UpdateVodDto extends PartialType(CreateVodDto) {}
