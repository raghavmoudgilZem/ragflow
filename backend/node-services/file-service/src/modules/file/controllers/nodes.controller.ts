import {
  Controller,
  Get,
  Headers,
  Logger,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ListFolderQueryDto } from '../dto/list-folder-query.dto';
import { NodeAncestorResponseDto } from '../dto/node-ancestor-response.dto';
import { NodeMetadataResponseDto } from '../dto/node-metadata-response.dto';
import { FolderService } from '../services/folder.service';

@ApiTags('Nodes')
@Controller('nodes')
export class NodesController {
  private readonly logger = new Logger(NodesController.name);

  constructor(private readonly folderService: FolderService) {}

  @Get()
  @ApiOperation({
    summary: 'List files and folders',
    description:
      'Returns the direct children of a folder. If parentId is not provided, root level nodes are returned.',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder contents retrieved successfully.',
  })
  async listFolderNodes(
    @Headers('x-tenant-id') tenantId: string,
    @Query() query: ListFolderQueryDto,
  ): Promise<unknown> {
    this.logger.log(
      `Listing folder nodes - parentId=${query.parentId ?? 'root'}, search=${query.search ?? 'none'}`,
    );

    return this.folderService.listFolderNodes(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get node metadata',
    description: 'Retrieves metadata for a file or folder by node ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Node identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Node metadata retrieved successfully.',
    type: NodeMetadataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Node not found.',
  })
  async getNodeMetadata(
    @Headers('x-tenant-id') tenantId: string,
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<NodeMetadataResponseDto> {
    this.logger.log(
      `Getting node metadata for tenant=${tenantId}, nodeId=${id}`,
    );

    return this.folderService.getNodeMetadata(id, tenantId);
  }

  @Get(':id/ancestors')
  @ApiOperation({
    summary: 'Get parent folder path',
    description:
      'Returns the parent folder hierarchy from root to the immediate parent of the specified node.',
  })
  @ApiParam({
    name: 'id',
    description: 'Node identifier',
    type: 'string',
    format: 'uuid',
  })
  @ApiOkResponse({
    description: 'Ancestor path retrieved successfully.',
    type: NodeAncestorResponseDto,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'Node not found.',
  })
  async getNodeAncestors(
    @Headers('x-tenant-id') tenantId: string,
    @Param(
      'id',
      new ParseUUIDPipe({
        version: '4',
      }),
    )
    id: string,
  ): Promise<NodeAncestorResponseDto[]> {
    this.logger.log(
      `Getting node ancestors for tenant=${tenantId}, nodeId=${id}`,
    );

    return this.folderService.getNodeAncestors(id, tenantId);
  }
}
