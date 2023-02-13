import { classToClass, classToPlain } from "class-transformer";

export class Base {
    clone() {
        return classToClass(this);
    }

    toJSON() {
        return JSON.stringify(classToPlain(this));
    }

    equals(object: Base) {
        return this.toJSON() == object.toJSON();
    }

    generateId() {
        return Math.random()
            .toString(36)
            .substring(2, 12);
    }
}
