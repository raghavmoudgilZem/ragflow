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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const tenant_roles_decorator_1 = require("../decorators/tenant-roles.decorator");
let TenantRolesGuard = class TenantRolesGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const requiredRoles = this.reflector.get(tenant_roles_decorator_1.TENANT_ROLES_KEY, context.getHandler());
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user?.userId) {
            throw new common_1.UnauthorizedException();
        }
        const tenantId = request.params?.tenantId;
        if (!tenantId) {
            throw new common_1.BadRequestException('tenantId route parameter is required');
        }
        const membership = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: user.userId,
                    tenantId,
                },
            },
        });
        if (!membership) {
            throw new common_1.ForbiddenException('You are not a member of the requested tenant workspace.');
        }
        const userRole = membership.role;
        if (requiredRoles && requiredRoles.length > 0) {
            if (!requiredRoles.includes(userRole)) {
                throw new common_1.ForbiddenException('Insufficient tenant role for this operation.');
            }
        }
        request.tenantContext = {
            tenantId,
            role: userRole,
        };
        return true;
    }
};
exports.TenantRolesGuard = TenantRolesGuard;
exports.TenantRolesGuard = TenantRolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], TenantRolesGuard);
//# sourceMappingURL=tenant-roles.guard.js.map