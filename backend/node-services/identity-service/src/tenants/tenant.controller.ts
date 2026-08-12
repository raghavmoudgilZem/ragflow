import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UnauthorizedException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { InviteTenantUserDto } from './dto/invite-tenant-user.dto';
import { UpdateTenantUserRoleDto } from './dto/update-tenant-user-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantRoles } from '../auth/decorators/tenant-roles.decorator';
import { TenantRole } from '../auth/enums/tenant-role.enum';
import { TenantRolesGuard } from '../auth/guards/tenant-roles.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tenants')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'tenants', version: '1' })
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new tenant' })
  async createTenant(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createTenantDto: CreateTenantDto,
  ) {
    if (!user?.userId) {
      throw new UnauthorizedException();
    }

    return this.tenantService.createTenant(user.userId, createTenantDto as any);
  }

  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @Post(':tenantId/users')
  @ApiOperation({ summary: 'Invite/add user to tenant' })
  async inviteTenantUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() inviteDto: InviteTenantUserDto,
  ) {
    return this.tenantService.addUserToTenant(tenantId, inviteDto);
  }

  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER)
  @Patch(':tenantId/users/:userId/role')
  @ApiOperation({ summary: 'Update tenant member role' })
  async updateMemberRole(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() updateDto: UpdateTenantUserRoleDto,
  ) {
    return this.tenantService.updateTenantUserRole(
      tenantId,
      targetUserId,
      updateDto.role,
    );
  }

  @UseGuards(JwtAuthGuard, TenantRolesGuard)
  @TenantRoles(TenantRole.OWNER, TenantRole.ADMIN)
  @Delete(':tenantId/users/:userId')
  @ApiOperation({ summary: 'Remove user from tenant' })
  async removeTenantUser(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.tenantService.removeUserFromTenant(tenantId, userId);
  }
}