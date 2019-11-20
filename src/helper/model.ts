import * as Api from "ts-api-client";

const api = new Api.DefaultApi();

export interface Omaha {
    domains: Api.OmahaProblemDomain[];
    problems: Api.OmahaProblem[];
    symptoms: Api.OmahaSymptom[];
    categories: Api.OmahaInterventionCategory[];
    targets: Api.OmahaInterventionTarget[];
}

export async function getOmaha(locale: string): Promise<Omaha> {
    let lang = 'EN';
    if (locale == 'de-de') lang = 'DE';
    // @ts-ignore
    const domains = api.appGetOmahaProblemDomains({ lang: lang });
    // @ts-ignore
    const problems = api.appGetOmahaProblems({ lang: lang });
    // @ts-ignore
    const symptoms = api.appGetOmahaSymptoms({ lang: lang });
    // @ts-ignore
    const categories = api.appGetOmahaInterventionCategories({ lang: lang });
    // @ts-ignore
    const targets = api.appGetOmahaInterventionTargets({ lang: lang });

    return {
      domains: await domains,
      problems: await problems,
      symptoms: await symptoms,
      categories: await categories,
      targets: await targets,
    };
}

export class OmahaQ implements Omaha {
    omaha: Omaha;
    constructor(omaha: Omaha) {
        this.omaha = omaha;
    }

    get domains() { return this.omaha.domains }
    get problems() { return this.omaha.problems }
    get symptoms() { return this.omaha.symptoms }
    get categories() { return this.omaha.categories }
    get targets() { return this.omaha.targets }

    problem(id: string): Api.OmahaProblem {
        return this.omaha.problems.find(el => el.id == id)!;
    }
    symptom(id: string): Api.OmahaSymptom {
        return this.omaha.symptoms.find(el => el.id == id)!;
    }
    category(id: string): Api.OmahaInterventionCategory {
        return this.omaha.categories.find(el => el.id == id)!;
    }
    target(id: string): Api.OmahaInterventionTarget {
        return this.omaha.targets.find(el => el.id == id)!;
    }

    categoryTitle(categoryId: string) { return this.category(categoryId).title }
    categoryDescription(categoryId: string) { return this.category(categoryId).description }
    problemTitle(problemId: string) { return this.problem(problemId).title }
    symptomTitle(symptomId: string) { return this.symptom(symptomId).title }
    targetTitle(targetId: string) { return this.target(targetId).title }
    targetDescription(targetId: string) { return this.target(targetId).description }
}

  
