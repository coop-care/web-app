import "reflect-metadata";
import { classToPlain, classToClass, Transform } from "class-transformer";
import { ObjectID } from "bson";

export class IdentifiableObject {
  // optional properties need an initial value because Vue does not detect the addition or removal of a property
  @Transform(({ value, obj, key }) => (value as ObjectID)?.toHexString(), { toPlainOnly: true })
  @Transform(({ value }) => new ObjectID(value), { toClassOnly: true })
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