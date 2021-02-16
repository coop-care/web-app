import "reflect-metadata";
import { plainToClass, classToClass } from "class-transformer";
import { IdentifiableObject } from ".";

export class TeamMember extends IdentifiableObject {
    userId: string;
    email?: string;
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

    get id() {
        return this._id?.toHexString() || "";
    }
    get username() {
        return (
            [this.firstName, this.lastName].filter(name => name).join(" ") ||
            this.signature
        );
    }

    makeAlumnus() {
        const clone = classToClass(this);
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
