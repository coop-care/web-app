import "reflect-metadata";
import { plainToClass } from "class-transformer";
import { CustomField, IdentifiableObject } from ".";

export class BackOffice extends IdentifiableObject {
  name: string;
  countryCode = "";
  admins: string[] = [];
  customFields: CustomField<any>[] = [];

  static fromObject(object: any): BackOffice | BackOffice[] {
    return plainToClass(BackOffice, object);
  }

  constructor(name: string, userId?: string) {
    super();
    this.name = name;

    if (userId) {
      this.admins.push(userId);
    }
  }

  customField(label: string) {
    return this.customFields.find(field => field.label == label);
  }
  customValue(label: string) {
    return this.customField(label)?.value;
  }
  updatedCustomField(label: string, value: any) {
    return [{
      ...this.customField(label),
      label,
      value,
    }].concat(this.customFields.filter(field => field.label != label));
  }
}