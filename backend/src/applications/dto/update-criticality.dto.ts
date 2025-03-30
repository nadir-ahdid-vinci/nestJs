import { PartialType } from '@nestjs/swagger';
import { CreateCriticalityDto } from './create-criticality.dto';

/**
 * DTO pour la mise à jour d'un niveau de criticité
 *
 * Ce DTO étend le CreateCriticalityDto en rendant tous les champs optionnels.
 * Cela permet de mettre à jour uniquement les champs souhaités sans avoir à fournir
 * toutes les données du niveau de criticité.
 *
 * Les règles de validation restent les mêmes que pour la création :
 * - Les valeurs doivent être dans l'ordre croissant : low < medium < high < critical
 * - Chaque valeur doit être comprise entre 0 et 100
 */
export class UpdateCriticalityDto extends PartialType(CreateCriticalityDto) {}
