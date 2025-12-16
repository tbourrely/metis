import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateResourceDTO {
  @ApiProperty()
  @IsUrl()
  readonly url: string;
}
