import { db } from '../db.js';
import { MockUserRecord, seedUsers, MockTenantUserRecord, seedTenantUsers } from './data.js';

export class IdentityRepository {
    static initSchema(): void {
        db.exec(`
          CREATE TABLE IF NOT EXISTS mock_users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            nickname TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT,
            current_tenant_id TEXT NOT NULL,
            time_zone TEXT DEFAULT 'UTC+8 Asia/Shanghai'
          )
        `);

        // Migration step: Safely add time_zone column if database file was created earlier
        try {
            db.exec(`ALTER TABLE mock_users ADD COLUMN time_zone TEXT DEFAULT 'UTC+8 Asia/Shanghai'`);
        } catch (error) {
            // Column already exists, safe to ignore
        }

        db.exec(`
          CREATE TABLE IF NOT EXISTS mock_tenant_users (
            id TEXT PRIMARY KEY,
            tenant_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL,
            status TEXT NOT NULL,
            joined_at TEXT NOT NULL
          )
        `);
    }

    static seedInitialData(): void {
        const checkEmptyUsers = db.prepare("SELECT count(*) as count FROM mock_users").get() as { count: number } | undefined;
        if ((checkEmptyUsers?.count ?? 0) === 0) {
            const insertUser = db.prepare(`
                INSERT INTO mock_users (id, email, nickname, password_hash, avatar_url, current_tenant_id, time_zone)
                VALUES (@id, @email, @nickname, @password_hash, @avatar_url, @current_tenant_id, @time_zone)
            `);
            try {
                db.exec('BEGIN TRANSACTION');
                for (const user of seedUsers) {
                    insertUser.run({
                        ...user,
                        time_zone: user.time_zone || 'UTC+8 Asia/Shanghai'
                    });
                }
                db.exec('COMMIT');
                console.log("🌱 Identity user authentication records seeded successfully.");
            } catch (error) {
                db.exec('ROLLBACK');
                console.error("Failed to seed authentication user structures:", error);
            }
        }

        const checkEmptyTenants = db.prepare("SELECT count(*) as count FROM mock_tenant_users").get() as { count: number } | undefined;
        if ((checkEmptyTenants?.count ?? 0) === 0) {
            const insertTenantUser = db.prepare(`
                INSERT INTO mock_tenant_users (id, tenant_id, user_id, name, email, role, status, joined_at)
                VALUES (@id, @tenant_id, @user_id, @name, @email, @role, @status, @joined_at)
            `);
            try {
                db.exec('BEGIN TRANSACTION');
                for (const tenantUser of seedTenantUsers) {
                    insertTenantUser.run(tenantUser);
                }
                db.exec('COMMIT');
                console.log("🌱 Multi-Tenant corporate workspace user tracking lines seeded successfully.");
            } catch (error) {
                db.exec('ROLLBACK');
                console.error("Failed to seed transaction-isolated multi-tenant lines:", error);
            }
        }
    }

    static findUserByEmail(email: string): MockUserRecord | undefined {
        return db.prepare("SELECT * FROM mock_users WHERE LOWER(email) = LOWER(?)").get(email) as MockUserRecord | undefined;
    }

    static findUserById(id: string): MockUserRecord | undefined {
        return db.prepare("SELECT * FROM mock_users WHERE id = ?").get(id) as MockUserRecord | undefined;
    }

    static createUser(user: MockUserRecord): void {
        db.prepare(`
          INSERT INTO mock_users (id, email, nickname, password_hash, avatar_url, current_tenant_id, time_zone)
          VALUES (@id, @email, @nickname, @password_hash, @avatar_url, @current_tenant_id, @time_zone)
        `).run({
            ...user,
            time_zone: user.time_zone || 'UTC+8 Asia/Shanghai'
        });
    }

    static updateUserProfile(id: string, updates: { nickname?: string; timeZone?: string; avatarUrl?: string }): boolean {
        const currentUser = this.findUserById(id);
        if (!currentUser) return false;

        const newNickname = updates.nickname !== undefined ? updates.nickname : currentUser.nickname;
        const newTimeZone = updates.timeZone !== undefined ? updates.timeZone : (currentUser.time_zone || 'UTC+8 Asia/Shanghai');
        const newAvatarUrl = updates.avatarUrl !== undefined ? updates.avatarUrl : currentUser.avatar_url;

        const result = db.prepare(`
            UPDATE mock_users 
            SET nickname = ?, time_zone = ?, avatar_url = ?
            WHERE id = ?
        `).run(newNickname, newTimeZone, newAvatarUrl, id);

        return result.changes > 0;
    }

    static updateUserPassword(id: string, newPasswordHash: string): boolean {
        const result = db.prepare("UPDATE mock_users SET password_hash = ? WHERE id = ?").run(newPasswordHash, id);
        return result.changes > 0;
    }

    static getTenantUsers(tenantId: string): any[] {
        return db.prepare("SELECT id, user_id as userId, name, email, role, status, joined_at as joinedAt FROM mock_tenant_users WHERE tenant_id = ?").all(tenantId);
    }

    static findTenantUserByEmail(tenantId: string, email: string): any | undefined {
        return db.prepare("SELECT * FROM mock_tenant_users WHERE tenant_id = ? AND LOWER(email) = LOWER(?)").get(tenantId, email);
    }

    static addTenantUser(id: string, tenantId: string, userId: string, name: string, email: string, role: string, status: string, joinedAt: string): void {
        db.prepare(`
            INSERT INTO mock_tenant_users (id, tenant_id, user_id, name, email, role, status, joined_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, tenantId, userId, name, email, role, status, joinedAt);
    }

    static deleteTenantUser(tenantId: string, memberId: string): void {
        db.prepare("DELETE FROM mock_tenant_users WHERE tenant_id = ? AND id = ?").run(tenantId, memberId);
    }
}