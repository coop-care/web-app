import "reflect-metadata";
import { plainToClass } from "class-transformer";
import { IdentifiableObject } from ".";

export class TeamMember extends IdentifiableObject {
    userId: string;
    email?: string = undefined;
    firstName = "";
    lastName = "";
    signature = "";

    static fromObject(object: any): TeamMember | TeamMember[] {
        return plainToClass(TeamMember, object);
    }
    static sortByName(a: TeamMember, b: TeamMember) {
        return a.username?.localeCompare(b.username);
    }

    constructor(userId: string, email?: string) {
        super();
        this.userId = userId;
        this.email = email?.toLowerCase();
    }

    get username() {
        return (
            [this.firstName, this.lastName].filter(Boolean).join(" ") ||
            this.signature
        );
    }

    makeAlumnus() {
        const clone = this.clone();
        delete clone._id;
        delete clone.email;
        return clone;
    }
}

export class User extends TeamMember {
    activeTeam = "";
    locale = "";
    colorScheme: string[] | undefined = undefined
    isOnboardingCompleted = false;

    static fromObject(object: any): User | User[] {
        return plainToClass(User, object);
    }
}
