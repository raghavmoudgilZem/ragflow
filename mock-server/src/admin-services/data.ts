import crypto from 'crypto';

export type ServiceStatus = 'Healthy' | 'Degraded' | 'Unhealthy';

// ---------------------------------------------------------------------------
// Admin auth
// ---------------------------------------------------------------------------

export interface AdminUserRecord {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
  tenantId: string;
}

export interface AdminLoginData {
  id: string;
  email: string;
  name: string;
  roles: string[];
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

const adminUsers: AdminUserRecord[] = [
  {
    id: '2211b67d-180a-44a1-8038-064bb54dd188',
    email: 'superadmin@demo.com',
    password: 'Pass@123',
    name: 'SUPER_ADMIN_OWNER',
    roles: ['Owner'],
    tenantId: '3a6e9cc5-636b-4fbb-a9b1-ab23979dd92a',
  },
];

const base64url = (input: object | Buffer): string => {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(JSON.stringify(input));
  return buf.toString('base64url');
};

const buildMockAccessToken = (user: AdminUserRecord, expiresInSeconds: number): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user.id,
    email: user.email,
    tenantId: user.tenantId,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': user.roles[0] ?? 'Owner',
    status: 'Active',
    fresh: 'true',
    exp: nowSeconds + expiresInSeconds,
    iss: 'RAGFlow',
    aud: 'RAGFlow',
  };
  const signature = crypto.randomBytes(32).toString('base64url');
  return `${base64url(header)}.${base64url(payload)}.${signature}`;
};

const buildMockRefreshToken = (): string => crypto.randomBytes(48).toString('base64');

// In-memory store mapping an issued refresh_token -> the admin user it belongs
// to, plus its own expiry. Real RAGFlow would persist this in Redis/MySQL;
// for the mock server an in-memory Map is enough since data only needs to
// survive for the life of the process.
interface RefreshTokenRecord {
  userId: string;
  expiresAt: number; // epoch seconds
}

const refreshTokenStore = new Map<string, RefreshTokenRecord>();
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const issueRefreshToken = (userId: string): string => {
  const token = buildMockRefreshToken();
  refreshTokenStore.set(token, {
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL_SECONDS,
  });
  return token;
};

export function findAdminUserByEmail(email: string): AdminUserRecord | undefined {
  return adminUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function findAdminUserById(id: string): AdminUserRecord | undefined {
  return adminUsers.find((u) => u.id === id);
}

export function verifyAdminPassword(user: AdminUserRecord, password: string): boolean {
  return user.password === password;
}

export function issueAdminSession(user: AdminUserRecord): AdminLoginData {
  const expiresIn = 3600;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    access_token: buildMockAccessToken(user, expiresIn),
    refresh_token: issueRefreshToken(user.id),
    expires_in: expiresIn,
  };
}

export type RefreshResult =
  | { ok: true; session: AdminLoginData }
  | { ok: false; reason: 'invalid' | 'expired' };

// Validates an incoming refresh_token, rotates it (old one is invalidated so
// it can't be replayed), and issues a fresh access_token/refresh_token pair.
export function refreshAdminSession(refreshToken: string): RefreshResult {
  const record = refreshTokenStore.get(refreshToken);
  if (!record) {
    return { ok: false, reason: 'invalid' };
  }

  // One-time use: remove immediately regardless of outcome below.
  refreshTokenStore.delete(refreshToken);

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (record.expiresAt <= nowSeconds) {
    return { ok: false, reason: 'expired' };
  }

  const user = findAdminUserById(record.userId);
  if (!user) {
    return { ok: false, reason: 'invalid' };
  }

  return { ok: true, session: issueAdminSession(user) };
}

// Revokes a single refresh_token (used when the client passes its own
// refresh_token on logout). Returns true if a token was actually removed.
export function revokeRefreshToken(refreshToken: string): boolean {
  return refreshTokenStore.delete(refreshToken);
}

// Revokes every refresh_token issued to a given user — used when logout is
// called without a specific refresh_token, effectively a "log out everywhere".
// Access tokens are stateless JWT-shaped strings and aren't tracked server
// side, so they simply expire naturally at their exp claim; only refresh
// tokens (which gate getting a new session) can be actively revoked here.
export function revokeAllRefreshTokensForUser(userId: string): number {
  let revokedCount = 0;
  for (const [token, record] of refreshTokenStore.entries()) {
    if (record.userId === userId) {
      refreshTokenStore.delete(token);
      revokedCount += 1;
    }
  }
  return revokedCount;
}

export interface ServiceHealth {
  id: string;
  displayName: string;
  category: string;
  status: ServiceStatus;
  responseTime: number;
  version: string;
  message?: string;
}

export interface DependencyHealth {
  id: string;
  displayName: string;
  category: string;
  status: ServiceStatus;
  responseTime: number;
  version: string;
  message?: string;
}

export interface MonitoringHealthSummary {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  unhealthyServices: number;
  totalDependencies: number;
  healthyDependencies: number;
}

export interface MonitoringHealthResponse {
  overallStatus: ServiceStatus | 'Healthy' | 'Degraded' | 'Unhealthy';
  lastUpdated: string;
  summary: MonitoringHealthSummary;
  services: ServiceHealth[];
  dependencies: DependencyHealth[];
}

// Base seed data for the monitored microservices.
const services: ServiceHealth[] = [
  {
    id: 'identity-service',
    displayName: 'Identity Service',
    category: 'Microservice',
    status: 'Healthy',
    responseTime: 15,
    version: '1.0.0',
  },
  {
    id: 'admin-service',
    displayName: 'Admin Service',
    category: 'Microservice',
    status: 'Healthy',
    responseTime: 12,
    version: '1.0.0',
  },
  {
    id: 'document-service',
    displayName: 'Document Service',
    category: 'Microservice',
    status: 'Healthy',
    responseTime: 20,
    version: '2.1.0',
  },
  {
    id: 'rag-service',
    displayName: 'RAG Service',
    category: 'Microservice',
    status: 'Degraded',
    responseTime: 320,
    version: '2.0.1',
    message: 'High response time',
  },
];

// Base seed data for infrastructure dependencies.
const dependencies: DependencyHealth[] = [
  {
    id: 'mysql',
    displayName: 'MySQL',
    category: 'Database',
    status: 'Healthy',
    responseTime: 6,
    version: '8.0.42',
  },
  {
    id: 'redis',
    displayName: 'Redis',
    category: 'Cache',
    status: 'Healthy',
    responseTime: 3,
    version: '8.2.0',
  },
  {
    id: 'minio',
    displayName: 'MinIO',
    category: 'Object Storage',
    status: 'Healthy',
    responseTime: 9,
    version: 'RELEASE.2026-06-10',
  },
];

const jitter = (base: number): number => {
  const delta = Math.round(base * 0.15);
  const offset = Math.floor(Math.random() * (2 * delta + 1)) - delta;
  return Math.max(1, base + offset);
};

const deriveOverallStatus = (all: { status: ServiceStatus }[]): ServiceStatus => {
  if (all.some((item) => item.status === 'Unhealthy')) return 'Unhealthy';
  if (all.some((item) => item.status === 'Degraded')) return 'Degraded';
  return 'Healthy';
};

const buildSummary = (
  svc: ServiceHealth[],
  deps: DependencyHealth[],
): MonitoringHealthSummary => ({
  totalServices: svc.length,
  healthyServices: svc.filter((s) => s.status === 'Healthy').length,
  degradedServices: svc.filter((s) => s.status === 'Degraded').length,
  unhealthyServices: svc.filter((s) => s.status === 'Unhealthy').length,
  totalDependencies: deps.length,
  healthyDependencies: deps.filter((d) => d.status === 'Healthy').length,
});

// Returns a fresh snapshot on every call so responseTime/lastUpdated feel "live"
// while status/category/version stay stable across requests.
export function getMonitoringHealthSnapshot(): MonitoringHealthResponse {
  const svcSnapshot = services.map((s) => ({ ...s, responseTime: jitter(s.responseTime) }));
  const depSnapshot = dependencies.map((d) => ({ ...d, responseTime: jitter(d.responseTime) }));

  return {
    overallStatus: deriveOverallStatus(svcSnapshot),
    lastUpdated: new Date().toISOString(),
    summary: buildSummary(svcSnapshot, depSnapshot),
    services: svcSnapshot,
    dependencies: depSnapshot,
  };
}
