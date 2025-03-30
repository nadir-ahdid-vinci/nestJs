export enum UserRole {
  ADMIN = 'admin',
  DEV = 'dev',
  HUNTER = 'hunter',
}

// Définition de la hiérarchie des rôles
export const RoleHierarchy = {
  [UserRole.HUNTER]: [UserRole.HUNTER], // Un `HUNTER` a seulement son propre rôle
  [UserRole.DEV]: [UserRole.DEV, UserRole.HUNTER], // Un `DEV` peut faire tout ce qu'un `HUNTER` fait
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.DEV, UserRole.HUNTER], // Un admin a tous les droits
};
