import * as Api from "ts-api-client";

const api = new Api.DefaultApi();

export interface Omaha {
    domains: Api.OmahaProblemDomain[];
    problems: Api.OmahaProblem[];
    symptoms: Api.OmahaSymptom[];
}

export async function getOmaha(): Promise<Omaha> {
    const domains = api.appGetOmahaProblemDomains({});
    const problems = api.appGetOmahaProblems({});
    const symptoms = api.appGetOmahaSymptoms({});

    return {
      domains: await domains,
      problems: await problems,
      symptoms: await symptoms,
    };
}

export class OmahaQ implements Omaha {
    omaha: Omaha;
    constructor(omaha: Omaha) {
        this.omaha = omaha;
        Problem.omahaq = this;
    }
    get domains() { return this.omaha.domains }
    get problems() { return this.omaha.problems }
    get symptoms() { return this.omaha.problems }
    problem(id: string): Api.OmahaProblem {
        return this.omaha.problems.find(el => el.id == id)!;
    }
    symptom(id: string): Api.OmahaSymptom {
        return this.omaha.symptoms.find(el => el.id == id)!;
    }
    newProblem(apiProblem: Api.ProblemClassification): Problem {
        return new Problem(apiProblem);
    }

}

export class Problem {
    static omahaq: OmahaQ;
    apiProblem: Api.ProblemClassification;
    // omaha: Omaha;
    omahaProblem: Api.OmahaProblem;
    constructor(apiProblem: Api.ProblemClassification) {
        this.apiProblem = apiProblem;
        // this.omaha = omaha;
        this.omahaProblem = Problem.omahaq.problem(apiProblem.problemId!);
    }

    get title(): string { return this.omahaProblem.title! }
    get domainModifier(): string { return this.apiProblem.domainModifier! }
    get typeModifier(): string { return this.apiProblem.typeModifier! }
    get symptoms(): Api.OmahaSymptom[] {
        return this.apiProblem.symptoms!.map(id => Problem.omahaq.symptom(id));
    }
}
  
export class Symptom {

}  
  