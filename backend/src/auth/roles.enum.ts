export enum Role {
    HUNTER = 'HUNTER',
    HUNTER_DEV = 'HUNTER_DEV',
    HUNTER_ADMIN = 'HUNTER_ADMIN',
  }
  
  // Définition de la hiérarchie des rôles
  export const RoleHierarchy = {
    [Role.HUNTER]: [Role.HUNTER], // Un `HUNTER` a seulement son propre rôle
    [Role.HUNTER_DEV]: [Role.HUNTER_DEV, Role.HUNTER], // Un `HUNTER_DEV` peut faire tout ce qu'un `HUNTER` fait
    [Role.HUNTER_ADMIN]: [Role.HUNTER_ADMIN, Role.HUNTER_DEV, Role.HUNTER], // Un admin a tous les droits
  };
  