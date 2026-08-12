import { ApiProperty } from '@nestjs/swagger';
import { NodeType } from '@prisma/client';

export class NodeAncestorResponseDto {
  @ApiProperty({
    example: 'root-id',
  })
  id: string;

  @ApiProperty({
    example: 'root',
  })
  name: string;

  @ApiProperty({
    enum: NodeType,
    example: NodeType.FOLDER,
  })
  nodeType: NodeType;
}
