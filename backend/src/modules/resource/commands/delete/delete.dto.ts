import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteDTO {
  @IsUUID()
  @ApiProperty({ type: String, format: 'uuid' })
  @IsNotEmpty()
  readonly id: string;
}
