import { ObjectId } from "bson";

export const leistungsbereich = {
  "SGB V": "SGB V",
  "SGB XI": "SGB XI",
  "Privat": "Privat",
};
export type Leistungsbereich = keyof typeof leistungsbereich;

export const verguetungsart = {
  "Zeit": "Zeit",
  "Leistungskomplex": "Leistungskomplex",
};
export type Verguetungsart = keyof typeof verguetungsart;

export class Verguetungsvereinbarung {
  id = new ObjectId().toHexString();
  leistungsbereich: Leistungsbereich | "" = "";
  bundesland = "";
  kassenverband: string[] = [];
  kostentraegerIK: string[] = [];
  tarifkennzeichen = "";
  validFrom?: number;
  validUntil?: number;
  verguetungsart: Verguetungsart | "" = "";
  preisgruppen: string[] = [];
  leistungen: [] = [];

  get label() {
    return [
      this.leistungsbereich,
      this.kassenverband.join("/"),
      this.tarifkennzeichen ? "TK " + this.tarifkennzeichen : ""
    ].filter(Boolean).join(", ")
  }
}