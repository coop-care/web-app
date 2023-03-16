import { plainToInstance, instanceToPlain, ClassConstructor } from "class-transformer";

export class Base {
    clone() {
        return plainToInstance(this.constructor as ClassConstructor<this>, instanceToPlain(this));
    }

    toJSON() {
        return instanceToPlain(this);
    }

    toJSONString() {
        return JSON.stringify(this.toJSON());
    }

    equals(object: Base) {
        return this.toJSONString() == object.toJSONString();
    }

    generateId() {
        return Math.random()
            .toString(36)
            .substring(2, 12);
    }
}
