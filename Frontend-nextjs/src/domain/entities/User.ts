export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly avatar?: string,
    public readonly createdAt: Date = new Date()
  ) {}

  static create(data: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    createdAt?: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.name,
      data.avatar,
      data.createdAt || new Date()
    );
  }

  updateProfile(data: { name?: string; avatar?: string }): User {
    return new User(
      this.id,
      this.email,
      data.name || this.name,
      data.avatar || this.avatar,
      this.createdAt
    );
  }
}
