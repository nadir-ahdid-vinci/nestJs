import { HttpException, HttpStatus } from '@nestjs/common';

export class ApplicationNotFoundException extends HttpException {
  constructor(id: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Application avec l'ID ${id} non trouvée`,
        error: 'NOT_FOUND',
        details: {
          applicationId: id,
          type: 'APPLICATION_NOT_FOUND',
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ApplicationAlreadyExistsException extends HttpException {
  constructor(name: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Une application avec le nom "${name}" existe déjà`,
        error: 'CONFLICT',
        details: {
          applicationName: name,
          type: 'APPLICATION_ALREADY_EXISTS',
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidApplicationStatusException extends HttpException {
  constructor(currentStatus: string, targetStatus: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Impossible de passer du statut ${currentStatus} à ${targetStatus}`,
        error: 'BAD_REQUEST',
        details: {
          currentStatus,
          targetStatus,
          type: 'INVALID_STATUS_TRANSITION',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidLogoException extends HttpException {
  constructor(message: string, details?: Record<string, any>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'BAD_REQUEST',
        details: {
          ...details,
          type: 'INVALID_LOGO',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnauthorizedApplicationAccessException extends HttpException {
  constructor(userId?: number, applicationId?: number) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: "Vous n'avez pas les droits pour accéder à cette application",
        error: 'FORBIDDEN',
        details: {
          userId,
          applicationId,
          type: 'UNAUTHORIZED_ACCESS',
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class CriticalityNotFoundException extends HttpException {
  constructor(idOrMessage: number | string) {
    const message =
      typeof idOrMessage === 'number'
        ? `Criticité avec l'ID ${idOrMessage} non trouvée`
        : idOrMessage;
    super(message, HttpStatus.NOT_FOUND);
  }
}

export class CriticalityAlreadyExistsException extends HttpException {
  constructor(name: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Une criticité avec le nom "${name}" existe déjà`,
        error: 'CONFLICT',
        details: {
          criticalityName: name,
          type: 'CRITICALITY_ALREADY_EXISTS',
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class InvalidCriticalityValuesException extends HttpException {
  constructor(details: Record<string, number>) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Les valeurs de criticité sont invalides',
        error: 'BAD_REQUEST',
        details: {
          ...details,
          type: 'INVALID_CRITICALITY_VALUES',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ApplicationLogNotFoundException extends HttpException {
  constructor(applicationId: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `Aucun log trouvé pour l'application ${applicationId}`,
        error: 'NOT_FOUND',
        details: {
          applicationId,
          type: 'APPLICATION_LOG_NOT_FOUND',
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class InvalidApplicationLogActionException extends HttpException {
  constructor(action: string, validActions: string[]) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `L'action "${action}" n'est pas valide`,
        error: 'BAD_REQUEST',
        details: {
          invalidAction: action,
          validActions,
          type: 'INVALID_LOG_ACTION',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MissingLogoException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Le logo de l'application est obligatoire",
        error: 'BAD_REQUEST',
        details: {
          type: 'MISSING_LOGO',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidApplicationPageException extends HttpException {
  constructor(page: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Page invalide : ${page}`,
        error: 'BAD_REQUEST',
        details: {
          page,
          type: 'INVALID_APPLICATION_PAGE',
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ApplicationStatisticsException extends HttpException {
  constructor(applicationId: number, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la récupération des statistiques de l'application ${applicationId}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          applicationId,
          error,
          type: 'APPLICATION_STATISTICS_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ApplicationHallOfFameException extends HttpException {
  constructor(applicationId: number, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la récupération du Hall of Fame de l'application ${applicationId}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          applicationId,
          error,
          type: 'APPLICATION_HALL_OF_FAME_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ApplicationUpdateException extends HttpException {
  constructor(id: number, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la mise à jour de l'application ${id}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          applicationId: id,
          error,
          type: 'APPLICATION_UPDATE_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ApplicationLogsException extends HttpException {
  constructor(applicationId?: number) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: applicationId
          ? `Erreur lors de la récupération des logs de l'application ${applicationId}`
          : 'Erreur lors de la récupération des logs',
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          ...(applicationId ? { applicationId } : {}),
          type: 'APPLICATION_LOGS_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class StatisticsCalculationException extends HttpException {
  constructor(applicationId: number, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors du calcul des statistiques pour l'application ${applicationId}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          applicationId,
          error,
          type: 'STATISTICS_CALCULATION_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class LogCreationException extends HttpException {
  constructor(applicationId: number, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la création du log pour l'application ${applicationId}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          applicationId,
          error,
          type: 'LOG_CREATION_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class LogQueryException extends HttpException {
  constructor(error: string, filters?: Record<string, any>) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la requête des logs`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          error,
          filters,
          type: 'LOG_QUERY_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class CriticalityLogNotFoundException extends HttpException {
  constructor(criticalityId?: number) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: criticalityId
          ? `Aucun log trouvé pour la criticité ${criticalityId}`
          : 'Aucun log de criticité trouvé',
        error: 'NOT_FOUND',
        details: {
          criticalityId,
          type: 'CRITICALITY_LOG_NOT_FOUND',
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
