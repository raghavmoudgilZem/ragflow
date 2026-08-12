"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantRoles = exports.TENANT_ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.TENANT_ROLES_KEY = 'tenant_roles';
const TenantRoles = (...roles) => (0, common_1.SetMetadata)(exports.TENANT_ROLES_KEY, roles);
exports.TenantRoles = TenantRoles;
//# sourceMappingURL=tenant-roles.decorator.js.map