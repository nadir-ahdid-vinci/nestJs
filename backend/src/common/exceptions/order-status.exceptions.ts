import { HttpException, HttpStatus } from "@nestjs/common";

export class InvalidOrderStatusDtoException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class OrderStatusAlreadyExistsException extends HttpException {
  constructor(name: string) {
    super(`Un statut de commande avec le nom "${name}" existe déjà`, HttpStatus.CONFLICT);
  }
}

export class OrderStatusNotFoundByIdException extends HttpException {
  constructor(id: number) {
    super(`Le statut de commande avec l'ID ${id} n'existe pas`, HttpStatus.NOT_FOUND);
  }
}

export class OrderStatusInUseException extends HttpException {
  constructor(id: number) {
    super(`Le statut de commande avec l'ID ${id} ne peut pas être supprimé car il est utilisé par des commandes`, HttpStatus.FORBIDDEN);
  }
}

export class OrderStatusNotFoundException extends HttpException {
  constructor(id: number) {
    super(`Le statut de commande avec l'ID ${id} n'existe pas`, HttpStatus.NOT_FOUND);
  }
}

export class OrderStatusNameNotFoundException extends HttpException {
  constructor(name: string) {
    super(`Le statut de commande avec le nom "${name}" n'existe pas`, HttpStatus.NOT_FOUND);
  }
}




