import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { mongoUserService, MongoUser, AppRole } from './mongodb.ts';

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'kanyakriti_jwt_secure_secret_2026_antigravity';
}

export const SESSION_COOKIE_NAME = 'kanyakriti_session';

export interface AuthTokenPayload {
  userId: string;
  role: AppRole;
  email: string;
  name: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: MongoUser;
      tokenPayload?: AuthTokenPayload;
      isDemoSession?: boolean;
    }
  }
}

// Generate JWT token
export function generateToken(user: MongoUser): string {
  const payload: AuthTokenPayload = {
    userId: user._id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

// Verify and decode JWT token
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}

// Set HttpOnly secure session cookie
export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// Clear session cookie on logout
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

// Sanitize user for safe API responses (never return password_hash)
export function sanitizeUser(user: MongoUser) {
  return {
    id: user._id,
    email: user.email,
    phone: user.phone,
    role: user.role.toLowerCase() as 'buyer' | 'artisan' | 'runner' | 'admin',
    dbRole: user.role,
    name: user.name,
    avatar: user.avatar_url,
    is_verified: user.is_verified,
    is_active: user.is_active,
    created_at: user.created_at,
    last_login_at: user.last_login_at,
  };
}

// Extract token from cookie or Authorization header
function extractToken(req: Request): string | null {
  // 1. Check cookies
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 3. Check custom header x-auth-token
  const customHeader = req.headers['x-auth-token'];
  if (typeof customHeader === 'string' && customHeader.length > 0) {
    return customHeader;
  }

  return null;
}

// Middleware: Authenticate user session
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  // 1. Prioritize real cryptographically signed JWT token from cookie or Authorization header
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
      const user = await mongoUserService.findUserById(decoded.userId);
      if (user && user.is_active) {
        req.user = user;
        req.tokenPayload = decoded;
        return next();
      }
    } catch (err) {
      // Expired or invalid token - fallback to unauthenticated or demo
    }
  }

  // 2. Demo Mode fallback only if there is NO valid authenticated JWT session
  const demoRoleHeader = req.headers['x-demo-role'] as string;
  const demoUserId = req.headers['x-demo-user-id'] as string;

  if (demoRoleHeader) {
    const targetRole = demoRoleHeader.toUpperCase() as AppRole;
    let demoUser: MongoUser | null = null;
    if (demoUserId) {
      demoUser = await mongoUserService.findUserById(demoUserId);
    }
    if (!demoUser) {
      if (targetRole === 'ARTISAN') demoUser = await mongoUserService.findUserById('artisan-1');
      else if (targetRole === 'BUYER') demoUser = await mongoUserService.findUserById('buyer-1');
      else if (targetRole === 'RUNNER') demoUser = await mongoUserService.findUserById('runner-1');
      else if (targetRole === 'ADMIN') demoUser = await mongoUserService.findUserById('admin-1');
    }

    if (demoUser) {
      req.user = demoUser;
      req.isDemoSession = true;
      return next();
    }
  }

  next();
}

// Middleware: Require valid authenticated session
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Your session has expired. Please log in again.',
      code: 'UNAUTHENTICATED',
    });
  }
  next();
}

// Middleware: Require specific role(s)
export function requireRole(...allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Your session has expired. Please log in again.',
        code: 'UNAUTHENTICATED',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You don't have permission to access this page.",
        code: 'FORBIDDEN_ROLE',
        requiredRoles: allowedRoles,
        currentRole: req.user.role,
      });
    }

    next();
  };
}
