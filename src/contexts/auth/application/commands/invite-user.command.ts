export class InviteUserCommand {
  constructor(
    public readonly email: string,
    public readonly role: 'admin' | 'user',
  ) {}
}
