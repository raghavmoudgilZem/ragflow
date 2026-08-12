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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const tenant_role_enum_1 = require("../auth/enums/tenant-role.enum");
let TenantService = class TenantService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTenant(userId, name) {
        const tenant = await this.prisma.$transaction(async (tx) => {
            const createdTenant = await tx.tenant.create({
                data: {
                    name,
                },
            });
            await tx.userTenant.create({
                data: {
                    userId,
                    tenantId: createdTenant.id,
                    role: tenant_role_enum_1.TenantRole.OWNER,
                },
            });
            return createdTenant;
        });
        return {
            id: tenant.id,
            name: tenant.name,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
            role: tenant_role_enum_1.TenantRole.OWNER,
        };
    }
    async addUserToTenant(tenantId, inviteDto) {
        const user = inviteDto.userId && inviteDto.userId.trim().length > 0
            ? await this.prisma.user.findUnique({ where: { id: inviteDto.userId } })
            : await this.prisma.user.findUnique({ where: { email: inviteDto.email } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const existing = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: user.id,
                    tenantId,
                },
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('User is already a member of this tenant');
        }
        const role = inviteDto.role ?? tenant_role_enum_1.TenantRole.MEMBER;
        const membership = await this.prisma.userTenant.create({
            data: {
                userId: user.id,
                tenantId,
                role,
            },
        });
        return {
            id: membership.id,
            userId: membership.userId,
            tenantId: membership.tenantId,
            role: membership.role,
        };
    }
    async updateTenantUserRole(tenantId, targetUserId, newRole) {
        const targetMembership = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: targetUserId,
                    tenantId,
                },
            },
        });
        if (!targetMembership) {
            throw new common_1.NotFoundException('Target user is not a member of this tenant');
        }
        if (targetMembership.role === newRole) {
            return {
                id: targetMembership.id,
                userId: targetMembership.userId,
                tenantId: targetMembership.tenantId,
                role: targetMembership.role,
            };
        }
        if (targetMembership.role === tenant_role_enum_1.TenantRole.OWNER && newRole !== tenant_role_enum_1.TenantRole.OWNER) {
            const ownerCount = await this.prisma.userTenant.count({
                where: {
                    tenantId,
                    role: tenant_role_enum_1.TenantRole.OWNER,
                },
            });
            if (ownerCount <= 1) {
                throw new common_1.BadRequestException('Tenant must retain at least one OWNER. Role update blocked.');
            }
        }
        const updatedMembership = await this.prisma.userTenant.update({
            where: {
                userId_tenantId: {
                    userId: targetUserId,
                    tenantId,
                },
            },
            data: {
                role: newRole,
            },
        });
        return {
            id: updatedMembership.id,
            userId: updatedMembership.userId,
            tenantId: updatedMembership.tenantId,
            role: updatedMembership.role,
        };
    }
    async removeUserFromTenant(tenantId, targetUserId) {
        const membership = await this.prisma.userTenant.findUnique({
            where: {
                userId_tenantId: {
                    userId: targetUserId,
                    tenantId,
                },
            },
        });
        if (!membership) {
            throw new common_1.NotFoundException('User is not a member of this tenant');
        }
        if (membership.role === tenant_role_enum_1.TenantRole.OWNER) {
            const [ownerCount] = await this.prisma.$transaction([
                this.prisma.userTenant.count({
                    where: {
                        tenantId,
                        role: tenant_role_enum_1.TenantRole.OWNER,
                    },
                }),
            ]);
            if (ownerCount <= 1) {
                throw new common_1.BadRequestException('Cannot remove the last OWNER from the tenant.');
            }
        }
        await this.prisma.userTenant.delete({
            where: {
                userId_tenantId: {
                    userId: targetUserId,
                    tenantId,
                },
            },
        });
        return {
            message: 'User removed from tenant successfully',
            tenantId,
            userId: targetUserId,
        };
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map