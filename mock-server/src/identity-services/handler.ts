import { Router, Request, Response } from 'express';
import { IdentityRepository } from './repository.js';
import crypto from 'crypto';

export function registerIdentityRoutes(router: Router): void {
    router.post('/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required parameters." });
            }
            const user = IdentityRepository.findUserByEmail(email);
            if (!user || user.password_hash !== password) {
                return res.status(401).json({ error: "Invalid email address or password configuration." });
            }
            return res.status(200).json({
                accessToken: `mock-access-token-${crypto.randomUUID()}`,
                refreshToken: `mock-refresh-token-${crypto.randomUUID()}`,
                user: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    avatar_url: user.avatar_url,
                    current_tenant_id: user.current_tenant_id,
                    timeZone: user.time_zone || 'UTC+8 Asia/Shanghai'
                }
            });
        } catch (error) {
            console.error("Identity Login verification failure:", error);
            return res.status(500).json({ error: "Login failed due to an unexpected server processing error." });
        }
    });

    router.post('/auth/signup', (req: Request, res: Response) => {
        try {
            const { email, nickname, password } = req.body;
            if (!email || !nickname || !password) {
                return res.status(400).json({ error: "Missing required registration parameters." });
            }
            const userExists = IdentityRepository.findUserByEmail(email);
            if (userExists) {
                return res.status(400).json({ error: "An account with this email address already exists." });
            }
            const freshUser = {
                id: `usr-${crypto.randomUUID()}`,
                email,
                nickname,
                password_hash: password,
                avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nickname)}`,
                current_tenant_id: 'tn-01',
                time_zone: 'UTC+8 Asia/Shanghai'
            };
            IdentityRepository.createUser(freshUser);
            return res.status(201).json({ message: "Mock user registration processed successfully." });
        } catch (error) {
            console.error("Identity Registration integration failure:", error);
            return res.status(500).json({ error: "Registration failed due to a server error." });
        }
    });

    router.get('/user/profile', (req: Request, res: Response) => {
        try {
            const emailParam = (req.query.email as string) || 'veerababu.musamalla@zemosolabs.com';
            const user = IdentityRepository.findUserByEmail(emailParam) || IdentityRepository.findUserByEmail('veerababu.musamalla@zemosolabs.com');

            if (!user) {
                return res.status(404).json({ error: "Profile user record not found." });
            }
            return res.status(200).json({
                code: 0,
                message: 'Success',
                data: {
                    id: user.id,
                    email: user.email,
                    nickname: user.nickname,
                    name: user.nickname,
                    avatarUrl: user.avatar_url,
                    timeZone: user.time_zone || 'UTC+8 Asia/Shanghai',
                    currentTenantId: user.current_tenant_id,
                    roles: ['OWNER']
                }
            });
        } catch (error) {
            console.error("Get Profile Error:", error);
            return res.status(500).json({ error: "Internal server error reading profile." });
        }
    });

    router.put('/user/profile', (req: Request, res: Response) => {
        try {
            const { email, nickname, timeZone, avatarUrl } = req.body;
            const targetEmail = email || 'veerababu.musamalla@zemosolabs.com';
            const user = IdentityRepository.findUserByEmail(targetEmail) || IdentityRepository.findUserByEmail('veerababu.musamalla@zemosolabs.com');

            if (!user) {
                return res.status(404).json({ error: "User profile not found." });
            }

            IdentityRepository.updateUserProfile(user.id, { nickname, timeZone, avatarUrl });
            const updatedUser = IdentityRepository.findUserById(user.id);

            return res.status(200).json({
                code: 0,
                message: 'Profile updated successfully',
                data: {
                    id: updatedUser?.id,
                    email: updatedUser?.email,
                    nickname: updatedUser?.nickname,
                    name: updatedUser?.nickname,
                    avatarUrl: updatedUser?.avatar_url,
                    timeZone: updatedUser?.time_zone,
                    currentTenantId: updatedUser?.current_tenant_id,
                    roles: ['OWNER']
                }
            });
        } catch (error) {
            console.error("Update Profile Error:", error);
            return res.status(500).json({ error: "Internal server error updating profile." });
        }
    });

    router.put('/user/password', (req: Request, res: Response) => {
        try {
            const { email, currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: "Both currentPassword and newPassword are required parameters." });
            }

            const targetEmail = email || 'veerababu.musamalla@zemosolabs.com';
            const user = IdentityRepository.findUserByEmail(targetEmail) || IdentityRepository.findUserByEmail('veerababu.musamalla@zemosolabs.com');

            if (!user || user.password_hash !== currentPassword) {
                return res.status(400).json({ error: "Current password validation failed." });
            }

            IdentityRepository.updateUserPassword(user.id, newPassword);

            return res.status(200).json({
                code: 0,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error("Update Password Error:", error);
            return res.status(500).json({ error: "Internal server error updating password." });
        }
    });

    router.post('/users', (req: Request, res: Response) => {
        try {
            const { email, password, nickname } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Email and password are required parameters." });
            }

            const userExists = IdentityRepository.findUserByEmail(email);
            if (userExists) {
                return res.status(400).json({ error: "An account with this email address already exists." });
            }

            const freshUser = {
                id: `usr-${crypto.randomUUID()}`,
                email,
                nickname: nickname || email.split('@')[0],
                password_hash: password,
                avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nickname || email)}`,
                current_tenant_id: 'tn-01',
                time_zone: 'UTC+8 Asia/Shanghai'
            };

            IdentityRepository.createUser(freshUser);

            return res.status(201).json({
                code: 0,
                message: "User registered successfully",
                data: {
                    id: freshUser.id,
                    email: freshUser.email,
                    nickname: freshUser.nickname
                }
            });
        } catch (error) {
            console.error("User Creation Error:", error);
            return res.status(500).json({ error: "Internal server error registering user." });
        }
    });

    router.get('/auth/channels', (_req: Request, res: Response) => {
        return res.status(200).json({
            code: 0,
            message: 'Success',
            data: [
                { id: 'google', name: 'Google', enabled: true },
                { id: 'github', name: 'GitHub', enabled: true },
                { id: 'sso', name: 'Enterprise Single Sign-On', enabled: false }
            ]
        });
    });

    router.post('/auth/exchange', (req: Request, res: Response) => {
        try {
            const { code } = req.body;
            if (!code) {
                return res.status(400).json({ error: "Authorization code parameter is required." });
            }

            const user = IdentityRepository.findUserByEmail('veerababu.musamalla@zemosolabs.com');

            return res.status(200).json({
                code: 0,
                message: 'Authorization code exchange successful',
                data: {
                    accessToken: `mock-access-token-${crypto.randomUUID()}`,
                    refreshToken: `mock-refresh-token-${crypto.randomUUID()}`,
                    user: {
                        id: user?.id || 'usr-veera-123',
                        email: user?.email || 'veerababu.musamalla@zemosolabs.com',
                        nickname: user?.nickname || 'Veera',
                        avatar_url: user?.avatar_url || '',
                        timeZone: user?.time_zone || 'UTC+8 Asia/Shanghai',
                        current_tenant_id: 'tn-01'
                    }
                }
            });
        } catch (error) {
            console.error("Authorization Code Exchange Error:", error);
            return res.status(500).json({ error: "Internal server error during code exchange." });
        }
    });
}

export function registerTenantRoutes(router: Router): void {

    router.get('/tenants/:id/users', (req: Request, res: Response): void => {
        try {
            const { id } = req.params;
            const dbMembers = IdentityRepository.getTenantUsers(id);
            const pendingInvitations = dbMembers.filter(m => m.status === 'INVITED');

            res.status(200).json({
                members: dbMembers,
                pendingInvitations: pendingInvitations
            });
        } catch (error: any) {
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Main event loop execution intercepted runtime exception.'
            });
        }
    });

    router.post('/tenants/:id/users', (req: Request, res: Response): any => {
        try {
            const { id } = req.params;
            const { email, nickname, role } = req.body;

            if (!email || !nickname || !role) {
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: 'Mandatory structural fields validation failure.'
                });
            }

            const isDuplicate = IdentityRepository.findTenantUserByEmail(id, email);
            if (isDuplicate) {
                const descriptiveRole = isDuplicate.role?.toLowerCase() || 'member';
                return res.status(400).json({
                    error: 'BAD_REQUEST',
                    message: `${email} is the ${descriptiveRole} of the team.`
                });
            }

            const generatedMemId = `mem-${crypto.randomUUID()}`;
            const generatedUsrId = `usr-${crypto.randomUUID()}`;
            const formatTimestamp = new Date().toLocaleString('en-GB');

            IdentityRepository.addTenantUser(
                generatedMemId,
                id,
                generatedUsrId,
                nickname,
                email,
                role,
                'INVITED',
                formatTimestamp
            );

            return res.status(200).json({
                success: true,
                message: 'Invitation context generated and tracked successfully.',
                data: {
                    id: generatedMemId,
                    userId: generatedUsrId,
                    name: nickname,
                    email: email,
                    role: role,
                    status: 'INVITED',
                    joinedAt: formatTimestamp
                }
            });
        } catch (error: any) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Runtime exception crash isolated inside route interceptor.'
            });
        }
    });

    router.delete('/tenants/:id/users/:memberId', (req: Request, res: Response): any => {
        try {
            const { id, memberId } = req.params;
            IdentityRepository.deleteTenantUser(id, memberId);
            return res.status(200).json({
                success: true,
                message: 'Relational user map profiles cleanup operations finalized successfully.'
            });
        } catch (error: any) {
            return res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: error.message || 'Exception monitor successfully shielded main process node runtime loop.'
            });
        }
    });
}