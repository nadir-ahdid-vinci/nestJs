import { HttpException, HttpStatus } from '@nestjs/common';

export class RewardNotFoundByIdException extends HttpException {
  constructor(id: number) {
    super(`La récompense #${id} n'existe pas`, HttpStatus.NOT_FOUND);
  }
}

export class RewardNotFoundByNameException extends HttpException {
  constructor(name: string) {
    super(`La récompense ${name} n'existe pas`, HttpStatus.NOT_FOUND);
  }
}

export class RewardAlreadyExistsException extends HttpException {
  constructor(name: string) {
    super(`La récompense ${name} existe déjà`, HttpStatus.CONFLICT);
  }
}

export class RewardHasOrdersException extends HttpException {
  constructor() {
    super(
      'Impossible de supprimer une récompense qui a déjà été commandée',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidRewardPhotoException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class InsufficientPointsException extends HttpException {
  constructor() {
    super(
      "Vous n'avez pas assez de points pour commander cette récompense",
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class RewardNotAvailableException extends HttpException {
  constructor() {
    super("Cette récompense n'est pas disponible à la commande", HttpStatus.BAD_REQUEST);
  }
}

export class OutOfStockException extends HttpException {
  constructor() {
    super("Cette récompense n'est plus en stock", HttpStatus.BAD_REQUEST);
  }
}
