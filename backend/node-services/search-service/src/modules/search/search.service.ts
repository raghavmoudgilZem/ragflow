import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { SearchQueryDto } from './dto/search-query.dto';
import { User } from '../../common/decorators/user.decorator';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) { }

  async create(
    userId: string,
    tenantId: string | undefined,
    dto: CreateSearchDto,
  ) {
    this.logger.log(
      `Creating search config for user ${userId} in tenant ${tenantId ?? 'N/A'}`,
    );

    try {
      return await this.prisma.searchConfiguration.create({
        data: {
          name: dto.name,
          user_id: userId,
          tenant_id: tenantId ?? null, // Save as null if not provided
          search_config: {},
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(`Error creating search config: ${error.message}`);
      } else {
        this.logger.error(
          'Error creating search config: An unknown error occurred',
        );
      }
      throw new BadRequestException('Failed to create search configuration');
    }
  }

  async findAll(tenantId: string, query: SearchQueryDto) {
    const { keyword, page = 1, page_size = 50 } = query;

    this.logger.log(
      `Fetching search configs for tenant ${tenantId} - Page: ${page}, Size: ${page_size}, Keyword: ${keyword || 'None'}`,
    );

    // Calculate items to skip for offset pagination
    const skip = (page - 1) * page_size;

    // Build the dynamic where clause
    const whereClause: any = {
      tenant_id: tenantId,
    };

    // Apply insensative text search if keyword exists (matches your 'name' field, expand if needed)
    if (keyword) {
      whereClause.name = {
        contains: keyword,
      };
    }

    try {
      // Run both queries concurrently to maximize speed
      const [data, totalItems] = await Promise.all([
        this.prisma.searchConfiguration.findMany({
          where: whereClause,
          skip: skip,
          take: page_size,
          orderBy: {
            created_at: 'desc',
          },
        }),
        this.prisma.searchConfiguration.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(totalItems / page_size);

      return {
        items: data,
        totalItems,
        itemCount: data.length,
        itemsPerPage: page_size,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to fetch search configs for tenant ${tenantId}`,
          error.message,
        );
      } else {
        this.logger.error(
          `Error fetching search config for tenant ${tenantId}: An unknown error occurred`,
        );
      }
      throw new InternalServerErrorException(
        'Could not retrieve search configurations',
      );
    }
  }

  /**
   * Retrieves a specific configuration.
   * Validates tenant isolation and user ownership (with optional role bypass).
   */
  async findOne(id: string, user: User) {
    let config;
    const { tenantId, userId, roles } = user;

    try {
      config = await this.prisma.searchConfiguration.findUnique({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Database error fetching config with ID ${id}`,
          error.stack,
          error.message,
        );
      } else {
        this.logger.error(
          `Error fetching search config with ID ${id}: An unknown error occurred`,
        );
      }
      throw new InternalServerErrorException(
        'Error querying the configuration',
      );
    }

    if (!config) {
      throw new NotFoundException(
        `Search configuration with ID ${id} not found`,
      );
    }

    // 1. Tenant Isolation Check
    if (config.tenant_id !== null && config.tenant_id !== tenantId) {
      this.logger.warn(`Tenant mismatch: ${tenantId} tried accessing ${id}`);
      throw new ForbiddenException(
        'You do not have permission to access this configuration',
      );
    }

    // 2. User Ownership Check with Role Bypass
    const isOwnerOrAdmin = roles.includes('Owner') || roles.includes('Admin');

    if (config.user_id !== userId && !isOwnerOrAdmin) {
      this.logger.warn(
        `User mismatch: ${userId} tried accessing config owned by ${config.user_id}`,
      );
      throw new ForbiddenException(
        'You are not authorized to manage this configuration',
      );
    }

    return config;
  }

  async update(id: string, user: User, dto: UpdateSearchDto) {
    // 1. Verify existence and permissions
    const existingConfig = await this.findOne(id, user);

    try {
      const { search_config, search_id, ...rootFields } = dto;

      // 2. Safely extract existing JSON object (fallback to empty object if null)
      const currentJsonConfig =
        (existingConfig?.search_config as Record<string, any>) || {};

      return await this.prisma.searchConfiguration.update({
        where: { id },
        data: {
          ...rootFields,

          // 3. Keep all existing fields intact and merge the new search_config data as-is
          ...(search_config && {
            search_config: {
              ...currentJsonConfig,
              ...search_config,
            },
          }),
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to update config with ID ${id}`,
          error.stack,
          error.message,
        );
      } else {
        this.logger.error(
          `Error updating search config with ID ${id}: An unknown error occurred`,
        );
      }
      throw new BadRequestException(
        'Could not update search configuration. Check your payload data.',
      );
    }
  }

  async updateName(id: string, user: User, newName: string) {
    // 1. Verify existence, tenant isolation, and user permissions
    await this.findOne(id, user);

    try {
      this.logger.log(`Updating name for search config ${id} by user ${user.userId}`);

      // 2. Perform the targeted update
      return await this.prisma.searchConfiguration.update({
        where: { id },
        data: { name: newName },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to update name for config with ID ${id}`,
          error.stack,
          error.message,
        );
      } else {
        this.logger.error(
          `Error updating name for search config ${id}: An unknown error occurred`,
        );
      }
      throw new BadRequestException(
        'Could not update the search configuration name.',
      );
    }
  }

  async remove(id: string, user: User) {
    await this.findOne(id, user);
    try {
      return await this.prisma.searchConfiguration.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to delete config with ID ${id}`,
          error.stack,
          error.message,
        );
      } else {
        this.logger.error(
          `Error Deleting search config with ${id}: An unknown error occurred`,
        );
      }
      throw new InternalServerErrorException(
        'Could not delete the search configuration',
      );
    }
  }
}
