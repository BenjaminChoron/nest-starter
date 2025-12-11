export class CompleteProfileCommand {
  constructor(
    public readonly token: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly profilePicture?: string,
    public readonly phone?: string,
    public readonly address?: string,
  ) {}
}
