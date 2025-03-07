import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleHierarchy } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) {
      return true; // Si aucune restriction, tout le monde peut accéder
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Accès refusé.');
    }

    // Vérifier si l'utilisateur a le rôle requis ou un rôle supérieur
    const userRoles = RoleHierarchy[user.role] || [];
    if (userRoles.includes(requiredRole)) {
      return true;
    }

    throw new ForbiddenException('Accès refusé.');
  }
}
