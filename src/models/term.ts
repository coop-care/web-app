export class Term {
    code = "";
    title = "";
    description = "";

    constructor(path: string) {
        if (path) {
            this.code = path + ".code";
            this.title = path + ".title";
            this.description = path + ".description";
        }
    }
}
