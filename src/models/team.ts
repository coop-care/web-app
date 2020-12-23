import "reflect-metadata";
import { plainToClass, Type } from "class-transformer";
import { IdentifiableObject, TeamMember } from ".";

export class Team extends IdentifiableObject {
  name: string;
  members: string[] = [];
  admins: string[] = [];
  clients: string[] = [];
  @Type(() => TeamInvitation)
  invites: TeamInvitation[] = [];
  @Type(() => TeamMember)
  alumni: TeamMember[] = [];

  static fromObject(object: any): Team | Team[] {
    return plainToClass(Team, object);
  }

  constructor(name: string, userId?: string) {
    super();
    this.name = name;
    if (userId) {
      this.admins.push(userId);
    }
  }

  get allMembers() {
    return this.admins.concat(this.members)
  }
}

export class TeamInvitation {
  invitee: string;
  invitedBy: string;
  @Type(() => Date)
  invitedAt: Date;
  @Type(() => Date)
  acceptedAt?: Date;
  locale: string;
  assignAdminRole = false;

  constructor(invitee: string, invitedBy: string, locale: string) {
    this.invitee = invitee;
    this.invitedBy = invitedBy;
    this.invitedAt = new Date();
    this.locale = locale;
  }
}