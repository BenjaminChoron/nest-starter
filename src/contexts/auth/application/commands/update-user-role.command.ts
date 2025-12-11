export class UpdateUserRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
