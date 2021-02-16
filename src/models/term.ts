export class Term {
    code = "";
    title = "";
    description = "";
    icon = "";
    shortTitle = "";

    constructor(path: string) {
        if (path) {
            this.code = path + ".code";
            this.title = path + ".title";
            this.description = path + ".description";
            this.icon = path + ".icon";
        }
    }
}
