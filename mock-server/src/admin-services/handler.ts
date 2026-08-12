import { Router, Request, Response } from 'express';
import {
    findAdminUserByEmail,
    getMonitoringHealthSnapshot,
    issueAdminSession,
    refreshAdminSession,
    revokeAllRefreshTokensForUser,
    revokeRefreshToken,
    verifyAdminPassword,
} from './data.js';
import { requireAdminAuth } from './middleware.js';

export function registerAdminRoutes(router: Router): void {
    // GET /api/v1/admin/monitoring/health
    // Requires a valid "Authorization: Bearer <access_token>" issued by /admin/auth/login.
    router.get('/admin/monitoring/health', requireAdminAuth, (_req: Request, res: Response) => {
        try {
            const snapshot = getMonitoringHealthSnapshot();
            return res.status(200).json(snapshot);
        } catch (error) {
            console.error('Admin monitoring health check failure:', error);
            return res.status(500).json({ error: 'Failed to compute monitoring health due to an unexpected server error.' });
        }
    });

    // POST /api/v1/admin/auth/login
    router.post('/admin/auth/login', (req: Request, res: Response) => {
        try {
            const { email, password } = req.body ?? {};

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    errors: ['Email and password are required parameters.'],
                    data: null,
                });
            }

            const adminUser = findAdminUserByEmail(email);
            if (!adminUser || !verifyAdminPassword(adminUser, password)) {
                return res.status(401).json({
                    success: false,
                    errors: ['Invalid email address or password.'],
                    data: null,
                });
            }

            return res.status(200).json({
                success: true,
                errors: [],
                data: issueAdminSession(adminUser),
            });
        } catch (error) {
            console.error('Admin login failure:', error);
            return res.status(500).json({
                success: false,
                errors: ['Login failed due to an unexpected server processing error.'],
                data: null,
            });
        }
    });

    // POST /api/v1/admin/auth/refresh
    router.post('/admin/auth/refresh', (req: Request, res: Response) => {
        try {
            const { refresh_token } = req.body ?? {};

            if (!refresh_token) {
                return res.status(400).json({
                    success: false,
                    errors: ['refresh_token is a required parameter.'],
                    data: null,
                });
            }

            const result = refreshAdminSession(refresh_token);
            if (!result.ok) {
                const message = result.reason === 'expired'
                    ? 'The provided refresh token has expired. Please log in again.'
                    : 'The provided refresh token is invalid.';
                return res.status(401).json({
                    success: false,
                    errors: [message],
                    data: null,
                });
            }

            return res.status(200).json({
                success: true,
                errors: [],
                data: result.session,
            });
        } catch (error) {
            console.error('Admin token refresh failure:', error);
            return res.status(500).json({
                success: false,
                errors: ['Token refresh failed due to an unexpected server processing error.'],
                data: null,
            });
        }
    });

    // POST /api/v1/admin/auth/logout
    // Requires a valid "Authorization: Bearer <access_token>". Optionally accepts
    // a refresh_token in the body to revoke just that session; if omitted, every
    // refresh_token belonging to the authenticated user is revoked ("logout everywhere").
    router.post('/admin/auth/logout', requireAdminAuth, (req: Request, res: Response) => {
        try {
            const { refresh_token } = req.body ?? {};
            const userId = req.adminUser?.sub;

            if (refresh_token) {
                revokeRefreshToken(refresh_token);
            } else if (userId) {
                revokeAllRefreshTokensForUser(userId);
            }

            return res.status(200).json({
                success: true,
                errors: [],
                data: { message: 'Logged out successfully.' },
            });
        } catch (error) {
            console.error('Admin logout failure:', error);
            return res.status(500).json({
                success: false,
                errors: ['Logout failed due to an unexpected server processing error.'],
                data: null,
            });
        }
    });
}
