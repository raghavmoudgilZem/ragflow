import { NextFunction, Request, Response } from 'express';

export interface AdminTokenPayload {
    sub: string;
    email: string;
    tenantId: string;
    status: string;
    exp: number;
    iss: string;
    aud: string;
    [key: string]: unknown;
}

// Augment Express's Request type so downstream handlers can read req.adminUser.
declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            adminUser?: AdminTokenPayload;
        }
    }
}

const decodeMockToken = (token: string): AdminTokenPayload | null => {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
        const pad = (segment: string) => segment + '='.repeat((4 - (segment.length % 4)) % 4);
        const payloadJson = Buffer.from(pad(parts[1]), 'base64url').toString('utf-8');
        return JSON.parse(payloadJson) as AdminTokenPayload;
    } catch {
        return null;
    }
};

// Verifies the "Authorization: Bearer <access_token>" header issued by
// POST /api/v1/admin/auth/login. Since this is a mock server the signature
// segment isn't cryptographically re-verified — instead we check the token
// is well-formed, unexpired, and carries the expected issuer/audience.
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void | Response {
    const authHeader = req.headers.authorization ?? '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
            success: false,
            errors: ['Authorization header with a Bearer access token is required.'],
            data: null,
        });
    }

    const payload = decodeMockToken(token);
    if (!payload || payload.iss !== 'RAGFlow' || payload.aud !== 'RAGFlow') {
        return res.status(401).json({
            success: false,
            errors: ['The provided access token is invalid.'],
            data: null,
        });
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowSeconds) {
        return res.status(401).json({
            success: false,
            errors: ['The provided access token has expired.'],
            data: null,
        });
    }

    req.adminUser = payload;
    next();
}
