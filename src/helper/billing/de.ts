import {
  deserializeInstitutionLists,
  LeistungserbringergruppeSchluessel,
} from "paid-care";
import institutionsJSON from "paid-care/dist/kostentraeger.json";

export const mapToOptions = (map: Record<string, string>) =>
  Object.entries(map).map(([value, label]) => ({
    label: [value, label].join(" – "),
    value
  }));

const validInstitutions = (type: LeistungserbringergruppeSchluessel) => {
  const now = new Date();

  return deserializeInstitutionLists(JSON.stringify(institutionsJSON))
    .flatMap(list =>
      list.leistungserbringerGruppeSchluessel == type &&
        list.validityStartDate <= now
        ? list.institutions
        : []
    );
}

const getInsuranceOptions = (type: LeistungserbringergruppeSchluessel) => {
  const results = validInstitutions(type)
    .map(institution => ({
      value: institution.ik,
      label: institution.abbreviatedName.trim(),
      description: institution.name.trim() + ", IK " + institution.ik,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return results;
};

const getInsuranceDetails = (type: LeistungserbringergruppeSchluessel, ik: string) =>
  validInstitutions(type).find(institution => institution.ik == ik);

export const healthInsuranceOptions = () => getInsuranceOptions("5");
export const careInsuranceOptions = () => getInsuranceOptions("6");
export const healthInsuranceDetails = (ik: string) => getInsuranceDetails("5", ik);
export const careInsuranceDetails = (ik: string) => getInsuranceDetails("6", ik);

