import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NodeType, FileNode } from '@prisma/client';

export class NodeMetadataResponseDto {
  @ApiProperty({
    example: '8c66e22e-7c1e-11f1-8481-76d017067fac',
  })
  id: string;

  @ApiProperty({
    example: 'ollama.txt',
  })
  name: string;

  @ApiProperty({
    enum: NodeType,
    example: NodeType.FILE,
  })
  nodeType: NodeType;

  @ApiPropertyOptional({
    example: '5551a6bd-7c1d-11f1-b3a5-76d017067fac',
    nullable: true,
  })
  parentId: string | null;

  @ApiPropertyOptional({
    example: 'text/plain',
    nullable: true,
  })
  mimeType?: string | null;

  @ApiPropertyOptional({
    example: 'txt',
    nullable: true,
  })
  extension?: string | null;

  @ApiPropertyOptional({
    example: '935',
    description:
      'Serialized as string to safely represent database BigInt values.',
    nullable: true,
  })
  sizeBytes?: string | null;

  @ApiProperty({
    example: 'b2caeb99-7b5e-11f1-afeb-76d017067fac',
  })
  createdBy: string;

  @ApiProperty({
    example: '2026-07-10T08:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-10T08:00:00.000Z',
  })
  updatedAt: Date;

  static fromEntity(node: FileNode): NodeMetadataResponseDto {
    const dto = new NodeMetadataResponseDto();

    dto.id = node.id;
    dto.name = node.name;
    dto.nodeType = node.nodeType;
    dto.parentId = node.parentId;
    dto.createdBy = node.createdBy;
    dto.createdAt = node.createdAt;
    dto.updatedAt = node.updatedAt;

    if (node.nodeType === NodeType.FILE) {
      dto.mimeType = node.mimeType;
      dto.extension = node.extension;
      dto.sizeBytes = node.sizeBytes?.toString() ?? null;
    }

    return dto;
  }
}
