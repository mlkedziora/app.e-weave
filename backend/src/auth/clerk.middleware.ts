import { Request, Response, NextFunction } from 'express'
import { jwtVerify, createRemoteJWKSet } from 'jose'

const JWKS = createRemoteJWKSet(new URL(process.env.CLERK_JWT_JWKS!))

export const clerkMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: process.env.CLERK_JWT_ISSUER!,
    })

    req['user'] = {
      id: payload.sub!,
      email: payload.email as string,
      role: (payload.publicMetadata as any)?.role,
      teamId: (payload.publicMetadata as any)?.teamId,
    }

    return next()
  } catch (err) {
    console.error('JWT validation failed:', err)
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
