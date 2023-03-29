import "reflect-metadata";
import { ClassConstructor, instanceToPlain, plainToInstance, Transform } from "class-transformer";
import { ObjectId } from "bson";

export class IdentifiableObject {
  // optional properties need an initial value because Vue does not detect the addition or removal of a property
  @Transform(({ value }) => (value as ObjectId)?.toHexString(), { toPlainOnly: true })
  @Transform(({ value }) => value != undefined ? new ObjectId(value) : undefined, { toClassOnly: true })
  _id?: ObjectId = undefined;

  get id() {
    return this._id?.toHexString() || "";
  }

  equals(object: IdentifiableObject) {
    return this._id?.equals(object._id || "") || false;
  }

  toJSON() {
    return instanceToPlain(this);
  }

  clone() {
    return plainToInstance(this.constructor as ClassConstructor<this>, instanceToPlain(this));
  }

}