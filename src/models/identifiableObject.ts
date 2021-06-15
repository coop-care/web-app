import "reflect-metadata";
import { ClassConstructor, classToPlain, plainToClass, Transform } from "class-transformer";
import { ObjectID } from "bson";

export class IdentifiableObject {
  // optional properties need an initial value because Vue does not detect the addition or removal of a property
  @Transform(({ value }) => (value as ObjectID)?.toHexString(), { toPlainOnly: true })
  @Transform(({ value }) => new ObjectID(value), { toClassOnly: true })
  _id?: ObjectID = undefined;

  get id() {
    return this._id?.toHexString() || "";
  }

  equals(object: IdentifiableObject) {
    return this._id?.equals(object._id || "") || false;
  }

  toJSON() {
    return classToPlain(this);
  }

  clone() {
    return plainToClass(this.constructor as ClassConstructor<this>, classToPlain(this));
  }

}