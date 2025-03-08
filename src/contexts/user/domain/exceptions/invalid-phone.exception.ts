import { BadRequestException } from '@nestjs/common';

export class InvalidPhoneException extends BadRequestException {
  constructor(phone: string) {
    super(`Invalid phone number format: ${phone}`);
  }
}
