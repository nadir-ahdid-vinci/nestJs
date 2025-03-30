import { HttpException, HttpStatus } from "@nestjs/common";

export class OrderNotFoundException extends HttpException {
  constructor(id: number) {
    super(`La commande #${id} n'existe pas`, HttpStatus.NOT_FOUND);
  }
}

export class OrderAlreadyConfirmedException extends HttpException {
  constructor(id: number) {
    super(`La commande #${id} existe déjà`, HttpStatus.CONFLICT);
  }
}

export class OrderNotAvailableException extends HttpException {
  constructor() {
    super("La commande n'est pas disponible", HttpStatus.BAD_REQUEST);
  }
}
