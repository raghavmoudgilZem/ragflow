"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const tenant_service_1 = require("./tenant.service");
const create_tenant_dto_1 = require("./dto/create-tenant.dto");
const invite_tenant_user_dto_1 = require("./dto/invite-tenant-user.dto");
const update_tenant_user_role_dto_1 = require("./dto/update-tenant-user-role.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const tenant_roles_decorator_1 = require("../auth/decorators/tenant-roles.decorator");
const tenant_role_enum_1 = require("../auth/enums/tenant-role.enum");
const tenant_roles_guard_1 = require("../auth/guards/tenant-roles.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let TenantController = class TenantController {
    tenantService;
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async createTenant(user, createTenantDto) {
        if (!user?.userId) {
            throw new common_1.UnauthorizedException();
        }
        return this.tenantService.createTenant(user.userId, createTenantDto);
    }
    async inviteTenantUser(tenantId, inviteDto) {
        return this.tenantService.addUserToTenant(tenantId, inviteDto);
    }
    async updateMemberRole(tenantId, targetUserId, updateDto) {
        return this.tenantService.updateTenantUserRole(tenantId, targetUserId, updateDto.role);
    }
    async removeTenantUser(tenantId, userId) {
        return this.tenantService.removeUserFromTenant(tenantId, userId);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tenant' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_tenant_dto_1.CreateTenantDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "createTenant", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_roles_guard_1.TenantRolesGuard),
    (0, tenant_roles_decorator_1.TenantRoles)(tenant_role_enum_1.TenantRole.OWNER, tenant_role_enum_1.TenantRole.ADMIN),
    (0, common_1.Post)(':tenantId/users'),
    (0, swagger_1.ApiOperation)({ summary: 'Invite/add user to tenant' }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, invite_tenant_user_dto_1.InviteTenantUserDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "inviteTenantUser", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_roles_guard_1.TenantRolesGuard),
    (0, tenant_roles_decorator_1.TenantRoles)(tenant_role_enum_1.TenantRole.OWNER),
    (0, common_1.Patch)(':tenantId/users/:userId/role'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant member role' }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_tenant_user_role_dto_1.UpdateTenantUserRoleDto]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_roles_guard_1.TenantRolesGuard),
    (0, tenant_roles_decorator_1.TenantRoles)(tenant_role_enum_1.TenantRole.OWNER, tenant_role_enum_1.TenantRole.ADMIN),
    (0, common_1.Delete)(':tenantId/users/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove user from tenant' }),
    __param(0, (0, common_1.Param)('tenantId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "removeTenantUser", null);
exports.TenantController = TenantController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)({ path: 'tenants', version: '1' }),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map