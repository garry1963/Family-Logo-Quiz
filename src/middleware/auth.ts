// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { getSupabaseServer } from '../lib/supabase-server.ts';

export interface AuthUserInfo {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUserInfo;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token string' });
  }

  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.warn('Supabase token verification failed:', error?.message);
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired Supabase token' });
    }

    const u = data.user;
    req.user = {
      uid: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Player',
      picture: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
    };
    next();
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return res.status(401).json({ error: 'Unauthorized: Failed to authenticate' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      try {
        const supabase = getSupabaseServer();
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          const u = data.user;
          req.user = {
            uid: u.id,
            email: u.email,
            name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Player',
            picture: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          };
        }
      } catch (error) {
        console.warn('Optional Supabase auth verification error:', error);
      }
    }
  }
  next();
};
