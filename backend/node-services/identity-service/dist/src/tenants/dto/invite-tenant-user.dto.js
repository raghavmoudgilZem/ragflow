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
exports.InviteTenantUserDto = void 0;
const class_validator_1 = require("class-validator");
const tenant_role_enum_1 = require("../../auth/enums/tenant-role.enum");
class InviteTenantUserDto {
    email;
    userId;
    role;
}
exports.InviteTenantUserDto = InviteTenantUserDto;
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.userId),
    (0, class_validator_1.IsEmail)({}, { message: 'You must provide a valid user email or userId' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InviteTenantUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.email),
    (0, class_validator_1.IsUUID)('4', { message: 'You must provide a valid userId or email' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InviteTenantUserDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(tenant_role_enum_1.TenantRole, { message: 'role must be a valid TenantRole' }),
    __metadata("design:type", String)
], InviteTenantUserDto.prototype, "role", void 0);
//# sourceMappingURL=invite-tenant-user.dto.js.map