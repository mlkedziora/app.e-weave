// backend/src/auth/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AuthenticatedUser {
  id: string
  email: string
  role?: string
  teamId?: string
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
