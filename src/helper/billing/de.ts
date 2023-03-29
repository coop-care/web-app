
// import Dexie from "dexie";
// import {
//   LeistungserbringergruppeSchluessel,
//   InstitutionList,
//   Institution,
//   fetchInstitutionLists,
//   // deserializeInstitutionLists,
// } from "paid-care";
// // import institutionsJSON from "paid-care/dist/kostentraeger.json";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
}

// type LastUpdated = {
//   table: string;
//   date: Date;
// }

export const mapToOptions = (map: Record<string, string>): SelectOption[] =>
  Object.entries(map).map(([value, label]) => ({
    label: [value, label].filter(Boolean).join(" – "),
    value
  }));

export const mapToOptionsWithoutValue = (map: Record<string, string>): SelectOption[] =>
  Object.entries(map).map(([value, label]) => ({ label, value }));


export class BillingDatabase {
// export class BillingDatabase extends Dexie {
//   lastUpdated: Dexie.Table<LastUpdated>;
//   institutionLists: Dexie.Table<InstitutionList>;
//   healthInstitutions: Dexie.Table<Institution>;
//   careInstitutions: Dexie.Table<Institution>;

//   private static proxyFetch(input: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
//     const url = process.env.WEBAPI_URL || "";

//     return fetch(url + "/proxy", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         url: input,
//         method: init?.method,
//         headers: init?.headers,
//         data: init?.body || undefined,
//       })
//     });
//   }

//   constructor() {
//     super("de.billing");

//     this.version(1).stores({
//       lastUpdated: "table, date",
//       institutionLists: "++, issuerIK, leistungserbringerGruppeSchluessel, kassenart, validityStartDate",
//       healthInstitutions: "++, ik, name, abbreviatedName",
//       careInstitutions: "++, ik, name, abbreviatedName",
//     });

//     this.lastUpdated = this.table("lastUpdated");
//     this.institutionLists = this.table("institutionLists");
//     this.healthInstitutions = this.table("healthInstitutions");
//     this.careInstitutions = this.table("careInstitutions");
//   }

//  updateData() {
//     return this.updateInstitutions();
//  }

//   async healthInsuranceOptions() {
//     return (await this.healthInstitutions.toArray()).map(this.makeInstitutionOption);
//   }

//   async careInsuranceOptions() {
//     return (await this.careInstitutions.toArray()).map(this.makeInstitutionOption);
//   }

//   private async updateInstitutions(force = false) {
//     const nextUpdate = (await this.lastUpdated.get("institutionLists"))?.date;
//     // update every four weeks
//     nextUpdate?.setDate(nextUpdate?.getDate() + 28);

//     if (!force && !!nextUpdate && new Date() < nextUpdate) {
//       return false;
//     }

//     const institutionLists =
//       (await fetchInstitutionLists(BillingDatabase.proxyFetch)).map(result => result.institutionList);
//     // deserializeInstitutionLists(JSON.stringify((await import("paid-care/dist/kostentraeger.json")).default));

//     return this.transaction("rw", [
//       this.institutionLists,
//       this.healthInstitutions,
//       this.careInstitutions,
//       this.lastUpdated
//     ], async () => {
//       if (institutionLists.length == 0) {
//         throw "no institution lists loaded";
//       }

//       await this.institutionLists.clear();
//       await this.institutionLists.bulkAdd(institutionLists);

//       await this.healthInstitutions.clear();
//       await this.healthInstitutions.bulkAdd(this.filterValidInstitutions(institutionLists, "5"));

//       await this.careInstitutions.clear();
//       await this.careInstitutions.bulkAdd(this.filterValidInstitutions(institutionLists, "6"));

//       await this.lastUpdated.put({ table: "institutionLists", date: new Date() });

//       return true;
//     }).catch(error => {
//       console.error(error.message, error);

//       return false;
//     });
//   }

//   private filterValidInstitutions(institutionLists: InstitutionList[], type: LeistungserbringergruppeSchluessel) {
//     const now = new Date();

//     return institutionLists
//       .flatMap(list =>
//         list.leistungserbringerGruppeSchluessel == type && list.validityStartDate <= now
//           ? list.institutions.filter(item =>
//             (!item.validityFrom || item.validityFrom <= now) &&
//             (!item.validityTo || item.validityTo > now)
//           )
//           : []
//       )
//       .sort((a, b) => a.abbreviatedName.localeCompare(b.abbreviatedName));
//   }

//   private makeInstitutionOption(institution: Institution): SelectOption {
//     return {
//       value: institution.ik,
//       label: [institution.ik, institution.abbreviatedName.trim()].join(" – "),
//       description: institution.name.trim(),
//     }
//   }

}
