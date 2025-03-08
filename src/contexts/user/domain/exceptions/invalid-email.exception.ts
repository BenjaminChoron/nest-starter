import { BadRequestException } from '@nestjs/common';

export class InvalidEmailException extends BadRequestException {
  constructor(email: string) {
    super(`Invalid email format: ${email}`);
  }
}
