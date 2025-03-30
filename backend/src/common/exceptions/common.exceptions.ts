import { HttpException, HttpStatus } from '@nestjs/common';

export class StorageDirectoryException extends HttpException {
  constructor(path: string, error: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Erreur lors de la création du dossier de stockage : ${path}`,
        error: 'INTERNAL_SERVER_ERROR',
        details: {
          path,
          error,
          type: 'STORAGE_DIRECTORY_ERROR',
        },
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class TooManyUploadsException extends HttpException {
  constructor() {
    super(
      "Trop de tentatives d'upload. Veuillez réessayer dans une minute.",
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
