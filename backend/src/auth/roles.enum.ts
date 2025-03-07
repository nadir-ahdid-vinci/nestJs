export enum RoleEnum {
    HUNTER = 'HUNTER',
    HUNTER_DEV = 'HUNTER_DEV',
    HUNTER_ADMIN = 'HUNTER_ADMIN',
  }
  
  // Définition de la hiérarchie des rôles
  export const RoleHierarchy = {
    [RoleEnum.HUNTER]: [RoleEnum.HUNTER], // Un `HUNTER` a seulement son propre rôle
    [RoleEnum.HUNTER_DEV]: [RoleEnum.HUNTER_DEV, RoleEnum.HUNTER], // Un `HUNTER_DEV` peut faire tout ce qu'un `HUNTER` fait
    [RoleEnum.HUNTER_ADMIN]: [RoleEnum.HUNTER_ADMIN, RoleEnum.HUNTER_DEV, RoleEnum.HUNTER], // Un admin a tous les droits
  };
  