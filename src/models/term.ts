export class Term {
    code: string;
    title: string;
    description: string;

    constructor(path: string) {
        this.code = path + ".code";
        this.title = path + ".title";
        this.description = path + ".description";
    }
}
