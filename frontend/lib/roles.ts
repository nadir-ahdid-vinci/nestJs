// Définition de la hiérarchie des rôles
export const ROLES = {
    HUNTER: "HUNTER",
    HUNTER_DEV: "HUNTER_DEV",
    HUNTER_ADMIN: "HUNTER_ADMIN",
  } as const
  
  export type Role = keyof typeof ROLES
  
  // Hiérarchie des rôles (du plus bas au plus élevé)
  const ROLE_HIERARCHY: Role[] = [ROLES.HUNTER, ROLES.HUNTER_DEV, ROLES.HUNTER_ADMIN]
  
  /**
   * Vérifie si un utilisateur a un rôle suffisant pour accéder à une ressource
   * @param userRole - Le rôle de l'utilisateur
   * @param requiredRole - Le rôle requis pour accéder à la ressource
   * @returns boolean - True si l'utilisateur a un rôle suffisant
   */
  export function hasRequiredRole(userRole: string, requiredRole: Role): boolean {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole as Role)
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole)
  
    // Si le rôle de l'utilisateur n'est pas dans la hiérarchie, refuser l'accès
    if (userRoleIndex === -1) return false
  
    // Vérifier si le rôle de l'utilisateur est supérieur ou égal au rôle requis
    return userRoleIndex >= requiredRoleIndex
  }
  
  