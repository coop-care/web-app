import "reflect-metadata";
import { plainToClass, Type } from "class-transformer";
import { IdentifiableObject, TeamMember } from ".";

export class Team extends IdentifiableObject {
  name: string;
  members: string[] = [];
  admins: string[] = [];
  clients: string[] = [];
  invites: string[] = [];
  @Type(() => TeamMember)
  alumni: TeamMember[] = [];

  static fromObject(object: any): Team | Team[] {
    return plainToClass(Team, object);
  }

  constructor(name: string, userId: string) {
    super();
    this.name = name;
    this.admins.push(userId);
  }

  get allMembers() {
    return this.admins.concat(this.members)
  }
}