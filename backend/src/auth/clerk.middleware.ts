import { Request, Response, NextFunction } from 'express'
import { jwtVerify, createRemoteJWKSet, decodeProtectedHeader } from 'jose'

const JWKS = createRemoteJWKSet(new URL((globalThis as any).process?.env?.CLERK_JWT_JWKS!))

export const clerkMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization
  console.log('[Clerk Middleware] Authorization Header:', authHeader)

  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[Clerk Middleware] Missing or malformed token')
    return res.status(401).json({ message: 'Missing or invalid token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const header = decodeProtectedHeader(token)
    const issuer = (globalThis as any).process?.env?.CLERK_JWT_ISSUER!

    let verified;  // ✅ Use temp var to avoid destructuring TDZ bug in SWC

    if (header.alg === 'HS256') {
      console.log('[Clerk Middleware] Using HS256 verification');
      const secret = new TextEncoder().encode((globalThis as any).process?.env?.CLERK_SIGNING_KEY!)
      verified = await jwtVerify(token, secret, { issuer });
    } else {
      console.log('[Clerk Middleware] Using RS256 verification');
      verified = await jwtVerify(token, JWKS, { issuer });
    }

    const { payload } = verified;  // ✅ Destructure after assignment

    const user = {
      id: payload.sub!,
      email: payload.email as string,
      role: (payload.publicMetadata as any)?.role,
      teamId: (payload.publicMetadata as any)?.teamId,
    }

    req['user'] = user

    console.log('[Clerk Middleware] Decoded User:', user)
    return next()
  } catch (err) {
    console.error('[Clerk Middleware] JWT validation failed:', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}