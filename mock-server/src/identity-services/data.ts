import crypto from 'crypto';

export interface MockUserRecord {
    id: string;
    email: string;
    nickname: string;
    password_hash: string;
    avatar_url: string;
    current_tenant_id: string;
    name?: string;
    time_zone?: string;
}

export interface MockTenantUserRecord {
    id: string;
    tenant_id: string;
    user_id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    joined_at: string;
}

export const seedUsers: MockUserRecord[] = [
    {
        id: "usr-veera-123",
        email: "veerababu.musamalla@zemosolabs.com",
        nickname: "Veera",
        password_hash: "Password123",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=veera",
        current_tenant_id: "tn-01",
        time_zone: "UTC+8 Asia/Shanghai"
    },
    {
        id: "usr-alex-456",
        email: "alex.developer@zemosolabs.com",
        nickname: "Alex Developer",
        password_hash: "Password123!",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=alex",
        current_tenant_id: "tn-01",
        time_zone: "UTC+0 Europe/London"
    },
    {
        id: "usr-sarah-789",
        email: "sarah.manager@zemosolabs.com",
        nickname: "Sarah Manager",
        password_hash: "Password123!",
        avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=sarah",
        current_tenant_id: "tn-01",
        time_zone: "UTC-5 America/New_York"
    }
];

export const seedTenantUsers: MockTenantUserRecord[] = [
    {
        id: "mem-seed-1",
        tenant_id: "tn-01",
        user_id: "usr-veera-123",
        name: "Veera",
        email: "veerababu.musamalla@zemosolabs.com",
        role: "OWNER",
        status: "ACTIVE",
        joined_at: "14/07/2026 20:21:52"
    },
    {
        id: "mem-seed-2",
        tenant_id: "tn-01",
        user_id: "usr-alex-456",
        name: "Alex Developer",
        email: "alex.developer@zemosolabs.com",
        role: "MEMBER",
        status: "ACTIVE",
        joined_at: "15/07/2026 10:15:00"
    },
    {
        id: "mem-seed-3",
        tenant_id: "tn-01",
        user_id: "usr-sarah-789",
        name: "Sarah Manager",
        email: "sarah.manager@zemosolabs.com",
        role: "ADMIN",
        status: "ACTIVE",
        joined_at: "16/07/2026 11:30:22"
    }
];