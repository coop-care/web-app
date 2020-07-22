import "reflect-metadata";
import { Base } from "./base";

export class User extends Base {
    id: string;
    signature = "";
    email = "";
    isOnboardingCompleted = false;

    constructor(id: string) {
        super();
        this.id = id;
    }

    get username() {
        return this.signature;
    }
}
