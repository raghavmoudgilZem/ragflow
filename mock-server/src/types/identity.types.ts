// 📋 Type Definitions for internal mock store safety
export interface MockMember {
    id: string;
    userId: string;
    name: string;
    email: string;
    role: string;
    status: 'ACTIVE' | 'INVITED';
    joinedAt: string;
}

export interface MockTenantContext {
    members: MockMember[];
    pendingInvitations: any[];
}