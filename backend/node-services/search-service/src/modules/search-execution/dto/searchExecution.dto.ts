import {
    IsArray,
    IsString,
    IsNumber,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SearchExecutionPayloadDto {
    @ApiProperty({
        description: 'The search query or question to execute',
        example: 'where is magadha located',
    })
    @IsString()
    @IsNotEmpty()
    question!: string;

    @ApiPropertyOptional({
        description: 'The page number for pagination',
        example: 1,
        minimum: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({
        description: 'The number of results to return per page',
        example: 10,
        minimum: 1,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    size?: number;

    @ApiProperty({
        description: 'Unique identifier mapping to the search configuration',
        example: '646c2cb47a9511f1ad2039a9c6735fbc',
    })
    @IsString()
    @IsNotEmpty()
    search_id!: string;

    @ApiPropertyOptional({
        description: 'The tenant ID context for the search',
        example: null,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    tenant_id?: string | null;

    @ApiPropertyOptional({
        description: 'Array of dataset identifiers to override the default configuration',
        example: ['d68dd5ec7a9311f1ad2039a9c6735fbc'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dataset_ids?: string[];

    @ApiPropertyOptional({
        description: 'Flag to determine if response should include highlighted text (currently ignored in logic)',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    highlight?: boolean;
}