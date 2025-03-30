import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, RoleHierarchy } from '../users/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<UserRole>('role', context.getHandler());
    if (!requiredRole) {
      return true; // Si aucune restriction, tout le monde peut accéder
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Accès refusé : utilisateur non authentifié ou rôle manquant.');
    }

    // Vérifier si l'utilisateur a le rôle requis ou un rôle supérieur
    const userRoles = RoleHierarchy[user.role] || [];
    if (userRoles.includes(requiredRole)) {
      return true;
    }

    throw new ForbiddenException(
      `Accès refusé : le rôle ${user.role} n'a pas les permissions nécessaires.`,
    );
  }
}
