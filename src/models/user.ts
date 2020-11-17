import "reflect-metadata";
import { plainToClass, classToPlain, Exclude } from "class-transformer";
import { IdentifiableObject } from ".";

export class TeamMember extends IdentifiableObject {
    userId: string;
    firstName = "";
    lastName = "";
    signature = "";

    static fromObject(object: any): TeamMember | TeamMember[] {
        return plainToClass(TeamMember, object);
    }

    constructor(userId: string) {
        super();
        this.userId = userId;
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
}

export class UserData extends TeamMember {
    activeTeam = "";
    locale = "";
    colorScheme: string[] | undefined = undefined
    isOnboardingCompleted = false;

    static fromUser(user: User): UserData {
        const userData = classToPlain(user);
        return plainToClass(UserData, userData);
    }
}

export class User extends UserData {
    @Exclude()
    email: string;

    static fromObject(object: any): User | User[] {
        return plainToClass(User, object);
    }

    constructor(userId: string, email: string) {
        super(userId);
        this.email = email;
    }
}
