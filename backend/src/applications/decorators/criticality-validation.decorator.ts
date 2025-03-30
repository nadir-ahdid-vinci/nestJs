import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'criticalityOrder', async: false })
export class CriticalityOrderConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    return (
      object.low < object.medium && object.medium < object.high && object.high < object.critical
    );
  }

  defaultMessage(args: ValidationArguments) {
    return "Les niveaux de criticité doivent être dans l'ordre croissant: low < medium < high < critical";
  }
}

export function ValidateCriticalityOrder(validationOptions?: ValidationOptions) {
  return function (target: Function) {
    registerDecorator({
      target: target,
      propertyName: '',
      options: validationOptions,
      constraints: [],
      validator: CriticalityOrderConstraint,
    });
  };
}
