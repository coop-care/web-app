import "reflect-metadata";
import { plainToInstance } from "class-transformer";
import { CustomField, IdentifiableObject } from ".";

export class BackOffice extends IdentifiableObject {
  name: string;
  countryCode = "";
  admins: string[] = [];
  customFields: CustomField<any>[] = [];

  static fromObject(object: any): BackOffice | BackOffice[] {
    return plainToInstance(BackOffice, object);
  }

  constructor(name: string, userId?: string) {
    super();
    this.name = name;

    if (userId) {
      this.admins.push(userId);
    }
  }

  customField<T>(label: string): CustomField<T> | undefined {
    return this.customFields.find(field => field.label == label);
  }
  customValue<T>(label: string): T | undefined {
    return this.customField<T>(label)?.value;
  }
  updatedCustomField(label: string, value: any) {
    return [{
      ...this.customField(label),
      label,
      value,
    }].concat(this.customFields.filter(field => field.label != label));
  }
}