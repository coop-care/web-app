import "reflect-metadata";
import { Base } from "./base";

export class Setting extends Base {
    id = this.generateId();
    store: { [key: string]: any } = {};
}
