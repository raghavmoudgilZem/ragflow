import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateFolderDto } from '../dto/create-folder.dto';
import { FolderService } from '../services/folder.service';

@ApiTags('Folders')
@Controller('folders')
export class FoldersController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create folder',
  })
  @ApiCreatedResponse({
    description: 'Folder created successfully',
  })
  async createFolder(
    @Body() dto: CreateFolderDto,
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.folderService.createFolder(dto, tenantId, userId);
  }
}
