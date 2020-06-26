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
    categories: Category[];
    targets: HasTitleDescriptionCode[];
}
export interface Category extends HasTitleDescriptionCode {
    icon?: string;
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
    icons: {
        severity: string[];
        scope: string[];
        priority: string[];
        category: { [key: string]: string };
    };
}

export interface UsersGuide {
    [key: string]: {
        interventionSuggestions: {
            [key: string]: {
                [key: string]: string[];
            };
        };
        problemRatingScaleExamples: {
            ratings: {
                scale: {
                    title: string;
                }[];
            }[];
        };
        severityModifierExamples: string[];
    };
}

export function treeifyTerminology(
    list: HasTitleDescriptionCode[],
    key: string
): any {
    return list.map(item => {
        const result: any = {
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

        for (const key in item) {
            const value = (item as any)[key];
            if (Array.isArray(value)) {
                result.children = treeifyTerminology(value, key);
            }
        }

        return result;
    });
}

export function filterTerminology(node: HasTitleDescription, filter: string) {
    const regex = new RegExp(
        "(^|\\b)" + filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
    );
    return (
        (!!node.title && node.title.match(regex)) ||
        (!!node.description && node.description.match(regex))
    );
}

export function sortByTitle(a: HasTitle, b: HasTitle): number {
    return a.title.localeCompare(b.title);
}

export function flattenedProblems(terminology: Terminology): Problem[] {
    return terminology.problemClassificationScheme.domains
        .map(domain => domain.problems)
        .reduce(
            (previous, current) => previous.concat(current),
            [] as Problem[]
        );
}

export function makeTerminologyWithMaps(terminology: Terminology) {
    const result: TerminologyWithMaps = {
        title: terminology.title,
        problemClassificationScheme: terminology.problemClassificationScheme,
        interventionScheme: terminology.interventionScheme,
        problemRatingScale: terminology.problemRatingScale,
        problemByCode: {},
        symptomByCode: {},
        categoryByCode: {},
        targetByCode: {},
        icons: {
            severity: [],
            scope: [],
            priority: [],
            category: {}
        }
    };

    flattenedProblems(terminology).forEach(problem => {
        result.problemByCode[problem.code] = problem;

        problem.signsAndSymptoms.forEach(symptom => {
            const code = problem.code + "_" + symptom.code;
            result.symptomByCode[code] = symptom;
        });
    });

    result.icons.category = {
        "01": "fas fa-comment-medical",
        "02": "fas fa-band-aid",
        "03": "fas fa-project-diagram",
        "04": "fas fa-eye"
    };

    terminology.interventionScheme.categories.forEach(category => {
        category.icon = result.icons.category[category.code];
        result.categoryByCode[category.code] = category;
    });
    terminology.interventionScheme.targets.forEach(target => {
        result.targetByCode[target.code] = target;
    });

    result.icons.severity = [
        "fas fa-grin-wink",
        "fas fa-smile",
        "fas fa-frown-open"
    ];
    result.icons.scope = ["fas fa-user", "fas fa-user-friends", "fas fa-users"];
    result.icons.priority = ["fas fa-arrow-down", "fas fa-arrow-up"];

    return result;
}
