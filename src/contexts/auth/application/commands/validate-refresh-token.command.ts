export class ValidateRefreshTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly refreshToken: string,
  ) {}
}
