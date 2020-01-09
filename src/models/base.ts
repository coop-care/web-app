import { classToClass } from "class-transformer";

export class Base {
    clone() {
        return classToClass(this);
    }

    generateId() {
        return Math.random()
            .toString(36)
            .substring(2, 10);
    }
}
