import "reflect-metadata";
import { classToPlain, classToClass, Type } from "class-transformer";
import { ObjectID } from "bson";

export class IdentifiableObject {
  // optional properties need an initial value because Vue does not detect the addition or removal of a property
  @Type(() => ObjectID)
  _id?: ObjectID = undefined;

  equals(object: IdentifiableObject) {
    return this._id?.equals(object._id || "") || false;
  }

  toJSON() {
    return classToPlain(this);
  }

  clone() {
    return classToClass(this);
  }

}