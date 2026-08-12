import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  FILE_UPLOAD_FIELD_NAME,
  MAX_FILES_PER_UPLOAD,
} from '../../../common/constants/file.constants';
import { UploadFilesDto } from '../dto/upload-files.dto';
import { UploadFilesResponseDto } from '../dto/upload-file-response.dto';
import { FileService } from '../services/file.service';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  private readonly logger = new Logger(FilesController.name);

  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Upload one or more files',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        parentId: {
          type: 'string',
          format: 'uuid',
          nullable: true,
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Files uploaded successfully.',
    type: UploadFilesResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request.',
  })
  @UseInterceptors(
    FilesInterceptor(FILE_UPLOAD_FIELD_NAME, MAX_FILES_PER_UPLOAD),
  )
  async uploadFiles(
    @Body() dto: UploadFilesDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<UploadFilesResponseDto> {
    this.logger.log(`Uploading ${files?.length ?? 0} file(s)`);

    return this.fileService.uploadFiles(dto, files, tenantId, userId);
  }
}
