import { Strategy } from 'passport-jwt';
import { TenantRole, UserStatus } from '@prisma/client';
export type JwtPayload = {
    sub: string;
    email: string;
    status: UserStatus;
    activeTenantId?: string | null;
    tenantRole?: TenantRole | null;
    systemRole?: string | null;
};
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor();
    validate(payload: JwtPayload): {
        userId: string;
        email: string;
        status: "ACTIVE";
        activeTenantId: string | null;
        tenantRole: import("@prisma/client").$Enums.TenantRole | null;
        systemRole: string | null;
        role: string | null;
    };
}
export {};
