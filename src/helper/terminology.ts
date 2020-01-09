export interface HasTitle {
    title: string;
}
export interface HasDescription {
    description: string;
}
export interface HasCode {
    code: string;
    id?: string;
}
export interface HasTitleDescription extends HasTitle, HasDescription {}
export interface HasTitleCode extends HasTitle, HasCode {}
export interface HasTitleDescriptionCode extends HasTitleDescription, HasCode {}

export interface Terminology extends HasTitle {
    problemClassificationScheme: ProblemClassificationScheme;
    interventionScheme: InterventionScheme;
    problemRatingScale: ProblemRatingScale;
}
export interface ProblemClassificationScheme extends HasTitle {
    domains: Domain[];
    modifiers: {
        scope: HasTitleDescription[];
        severity: HasTitleDescription[];
    };
}
export interface Domain extends HasTitleDescriptionCode {
    problems: Problem[];
}
export interface Problem extends HasTitleDescriptionCode {
    signsAndSymptoms: HasTitleCode[];
}
export interface InterventionScheme extends HasTitle {
    categories: HasTitleDescriptionCode[];
    targets: HasTitleDescriptionCode[];
}
export interface ProblemRatingScale extends HasTitle {
    ratings: Rating[];
}
export interface Rating extends HasTitleDescription {
    scale: HasTitle[];
}
export interface TerminologyWithMaps extends Terminology {
    problemByCode: { [key: string]: Problem };
    symptomByCode: { [key: string]: HasTitleCode };
    categoryByCode: { [key: string]: HasTitleDescriptionCode };
    targetByCode: { [key: string]: HasTitleDescriptionCode };
}

export function treeifyTerminology(
    list: HasTitleDescriptionCode[],
    key: string
): any {
    let lastIndex = list.length - 1;
    return list.map((item, index) => {
        let result: any = {
            id: ["domains", "problems"].includes(key)
                ? key + "." + item.code
                : item.code,
            title: item.title,
            label: item.title,
            value: item.code,
            description: item.description,
            type: key,
            header: key,
            body: key,
            selectable: key == "problems"
        };

        for (let key in item) {
            let value = (item as any)[key];
            if (Array.isArray(value)) {
                result.children = treeifyTerminology(value, key);
            }
        }

        return result;
    });
}

export function filterTerminology(node: HasTitleDescription, filter: string) {
    let regex = new RegExp(
        "(^|\\b)" + filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
    );
    return (
        (node.title && node.title.match(regex)) ||
        (node.description && node.description.match(regex))
    );
}

export function sortByTitle(a: HasTitle, b: HasTitle): number {
    return a.title.localeCompare(b.title);
}

export function makeTerminologyWithMaps(terminology: Terminology) {
    let result: TerminologyWithMaps = {
        title: terminology.title,
        problemClassificationScheme: terminology.problemClassificationScheme,
        interventionScheme: terminology.interventionScheme,
        problemRatingScale: terminology.problemRatingScale,
        problemByCode: {},
        symptomByCode: {},
        categoryByCode: {},
        targetByCode: {}
    };

    flattenedProblems(terminology).forEach(problem => {
        result.problemByCode[problem.code] = problem;

        problem.signsAndSymptoms.forEach(symptom => {
            let code = problem.code + "_" + symptom.code;
            result.symptomByCode[code] = symptom;
        });
    });

    terminology.interventionScheme.categories.forEach(category => {
        result.categoryByCode[category.code] = category;
    });
    terminology.interventionScheme.targets.forEach(target => {
        result.targetByCode[target.code] = target;
    });

    return result;
}

export function flattenedProblems(terminology: Terminology): Problem[] {
    return terminology.problemClassificationScheme.domains
        .map(domain => domain.problems)
        .reduce(
            (previous, current) => previous.concat(current),
            [] as Problem[]
        );
}
