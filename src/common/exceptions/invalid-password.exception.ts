import { BadRequestException } from '@nestjs/common';

export class InvalidPasswordException extends BadRequestException {
  constructor(plainPassword: string) {
    super(`Invalid password format: ${plainPassword}`);
  }
}
