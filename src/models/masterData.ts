import "reflect-metadata";

export class MasterData {
    firstName = "";
    lastName = "";

    get name() {
        return (this.firstName + " " + this.lastName).trim();
    }
}
