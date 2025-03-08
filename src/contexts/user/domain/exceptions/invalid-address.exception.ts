import { BadRequestException } from '@nestjs/common';

export class InvalidAddressException extends BadRequestException {
  constructor(address: string) {
    super(`Invalid address format: ${address}`);
  }
}
