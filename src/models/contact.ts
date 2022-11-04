import "reflect-metadata";
import { Type, Transform } from "class-transformer";
import { Base, LabeledValue, CustomField } from ".";
import { ObjectID } from "bson";

export type PostalAddress = {
  street1: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
};

export class Contact extends Base {
  @Transform(({ value }) => (value as ObjectID)?.toHexString(), { toPlainOnly: true })
  @Transform(({ value }) => new ObjectID((value as string).padStart(12)), { toClassOnly: true })
  id = new ObjectID();
  userId?: string = undefined;
  externalSourceURL?: string = undefined;

  sex = "";
  firstName = "";
  lastName = "";
  @Type(() => Date)
  birthday?: Date = undefined;
  relationship = "";
  profession = "";
  degree = "";
  organization = "";
  isOrganization = false;
  phoneNumbers: LabeledValue<string>[] = [];
  emailAddresses: LabeledValue<string>[] = [];
  postalAddresses: LabeledValue<PostalAddress>[] = [];
  notes = "";
  customFields: CustomField<any>[] = [];

  static readonly emailLabels = ["privateLabel", "workLabel", "schoolLabel", "otherLabel"];
  static readonly phoneLabels = ["privateLabel", "mobileLabel", "workLabel", "centralOfficeLabel", "hospitalLabel", "schoolLabel", "faxLabel", "otherLabel"];
  static readonly postalLabels = ["privateLabel", "workLabel", "hospitalLabel", "schoolLabel", "invoiceAddress", "deliveryAddress"];
  static readonly sexTypes = ["femaleSex", "maleSex", "otherSex"];
  static readonly relationshipTypes = ["partner", "child", "parent", "sibling", "friend", "neighbour", "grandchild", "grandparent", "parentInLaw", "childInLaw"]
    .map(value => value + "Relationship");
  static readonly professionTypes = ["generalPractitioner", "pharmacy"]
    .map(value => value + "Profession");
  static readonly predefinedLabels = [...new Set(
    Contact.emailLabels
      .concat(Contact.phoneLabels)
      .concat(Contact.postalLabels)
      .concat(Contact.relationshipTypes)
      .concat(Contact.professionTypes)
  )]
  static postalAddressAsSearchString(address: PostalAddress) {
    return encodeURI(Object.values(address).filter(Boolean).join(",").replace(" ", "+"));
  }
  private static makeLabeledValue<T>(newValue: T, existingValues: LabeledValue<T>[] = [], allLabels: string[] = []) {
    return {
      label: this.findNewLabel(existingValues, allLabels),
      value: newValue
    };
  }
  private static findNewLabel<T>(existingValues: LabeledValue<T>[] = [], allLabels: string[] = []) {
    const labels = existingValues.map(value => value.label)
    return allLabels.find(label => !labels.includes(label)) || allLabels[0];
  }

  get idAsKey() {
    return this.id.toHexString();
  }
  get name() {
    if (this.isOrganization) {
      return this.organization.trim();
    } else {
      return [this.degree, this.firstName, this.lastName].filter(Boolean).join(" ").trim();
    }
  }

  makePhoneNumber() {
    return Contact.makeLabeledValue("", this.phoneNumbers, Contact.phoneLabels);
  }
  makeEmailAddress() {
    return Contact.makeLabeledValue("", this.emailAddresses, Contact.emailLabels);
  }
  makePostalAddress(country: string) {
    return Contact.makeLabeledValue({
      street1: "",
      postalCode: "",
      city: "",
      region: "",
      country: country
    }, this.postalAddresses, Contact.postalLabels);
  }
}
