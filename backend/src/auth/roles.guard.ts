// backend/src/auth/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Scope,
  Inject,
  ForbiddenException,  // Add for throwing 403
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable({ scope: Scope.DEFAULT }) // ✅ force default scope
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector, // ✅ explicit injection
  ) {
    console.log('✅ RolesGuard initialized:', this.reflector);
  }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.role || !roles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role permissions'); // Throw 403
    }

    return true;
  }
}