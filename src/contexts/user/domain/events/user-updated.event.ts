export class UserUpdatedEvent {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly profilePicture?: string,
    public readonly phone?: string,
    public readonly address?: string,
  ) {}
}
