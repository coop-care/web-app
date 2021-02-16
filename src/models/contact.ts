import "reflect-metadata";
import { Base, LabeledValue, CustomField } from ".";

export type PostalAddress = {
  street1: string;
  street2: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
};

export class Contact extends Base {
  id = this.generateId();
  userId?: string;
  externalSourceURL?: string;

  sex = "";
  firstName = "";
  lastName = "";
  birthday?: Date;
  relationship = "";
  profession = "";
  degree = "";
  phoneNumbers: LabeledValue<string>[] = [];
  emailAddresses: LabeledValue<string>[] = [];
  postalAddresses: LabeledValue<PostalAddress>[] = [];
  notes = "";
  customFields: CustomField<string>[] = [];

  static readonly emailLabels = ["privateLabel", "workLabel", "schoolLabel", "otherLabel"];
  static readonly phoneLabels = ["privateLabel", "mobileLabel", "workLabel", "centralOfficeLabel", "hospitalLabel", "schoolLabel", "faxLabel", "otherLabel"];
  static readonly postalLabels = ["privateLabel", "workLabel", "hospitalLabel", "schoolLabel", "invoiceAddress", "deliveryAddress"];
  static readonly sexTypes = ["femaleSex", "maleSex", "otherSex"];
  static readonly degreeTypes = ["medicalDoctorDegree", "philosophiaeDoctorDegree"];
  static readonly relationshipTypes = ["partner", "child", "parent", "sibling", "friend", "neighbour", "grandchild", "grandparent", "parentInLaw", "childInLaw"]
    .map(value => value + "Relationship");
  static readonly professionTypes = ["generalPractitioner"]
    .map(value => value + "Profession");
  static readonly predefinedLabels = [...new Set(
    Contact.emailLabels
      .concat(Contact.phoneLabels)
      .concat(Contact.postalLabels)
      .concat(Contact.relationshipTypes)
      .concat(Contact.professionTypes)
      .concat(Contact.degreeTypes)
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

  get name() {
    return [this.degree, this.firstName, this.lastName].filter(Boolean).join(" ").trim();
  }

  makePhoneNumber() {
    return Contact.makeLabeledValue("", this.phoneNumbers, Contact.phoneLabels);
  }
  makeEmailAddress() {
    return Contact.makeLabeledValue("", this.emailAddresses, Contact.phoneLabels);
  }
  makePostalAddress(country: string) {
    return Contact.makeLabeledValue({
      street1: "",
      street2: "",
      postalCode: "",
      city: "",
      region: "",
      country: country
    }, this.postalAddresses, Contact.postalLabels);
  }
}
