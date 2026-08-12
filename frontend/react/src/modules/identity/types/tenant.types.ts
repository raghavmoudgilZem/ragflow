export type TenantRole = "OWNER" | "MEMBER";

export type InvitationStatus = "ACTIVE" | "PENDING" | "EXPIRED";

export interface TenantMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: TenantRole;
    status: InvitationStatus;
    joinedAt: string;
}

export interface JoinedTeam {
    tenantId: string;
    tenantName: string;
    tenantCode: string;
    role: TenantRole;
    joinedAt: string;
}

export interface TenantMembersResponse {
    members: TenantMember[];
    joinedTeams: JoinedTeam[];
}