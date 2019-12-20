import * as Core from "../helper/coreTypes";

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

export default {
    treeify: function(list: any[], key: string): any {
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
                let value = item[key];
                if (Array.isArray(value)) {
                    result.children = this.treeify(value, key);
                }
            }

            return result;
        });
    },

    filter: function(node: HasTitleDescription, filter: string) {
        let regex = new RegExp(
            "(^|\\b)" + filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
            "gi"
        );
        return (
            (node.title && node.title.match(regex)) ||
            (node.description && node.description.match(regex))
        );
    },

    sortByTitle: function(a: HasTitle, b: HasTitle): number {
        return a.title.localeCompare(b.title);
    },

    mergeProblemRecordsAndTerminology: function(
        problemRecords: Core.ProblemRecord[],
        terminology: Terminology
    ): Core.ProblemRecord[] {
        let problemsTerminology = this.flattenedProblems(terminology);
        let modifiersTerminology =
            terminology.problemClassificationScheme.modifiers;
        let categoriesTerminology = terminology.interventionScheme.categories;
        let targetsTerminology = terminology.interventionScheme.targets;
        // let ratingsTerminology = terminology.problemRatingScale.ratings;
        // let knowledgeTerminology = ratingsTerminology[0];
        // let behaviourTerminology = ratingsTerminology[1];
        // let statusTerminology = ratingsTerminology[2];

        return problemRecords.map(record => {
            let problemTerminology = problemsTerminology.find(
                problemTerminology =>
                    problemTerminology.code == record.problem.id
            );

            if (problemTerminology) {
                record.problem.title = problemTerminology.title;
                record.problem.description = problemTerminology.description;

                record.problem.signsAndSymptoms.map(symptom => {
                    //@ts-ignore
                    let symptomTerminology = problemTerminology.signsAndSymptoms.find(
                        symptomTerminology =>
                            symptomTerminology.code == symptom.id
                    );

                    if (symptomTerminology) {
                        symptom.title = symptomTerminology.title;
                    }
                    return symptom;
                });
            }

            record.problem.titles = {
                scope: modifiersTerminology.scope[record.problem.scope].title,
                severity:
                    modifiersTerminology.severity[record.problem.severity]
                        .title,
                priorityKey: record.problem.isHighPriority
                    ? "highPriorityTitle"
                    : "lowPriorityTitle"
            };
            record.problem.descriptions = {
                scope:
                    modifiersTerminology.scope[record.problem.scope]
                        .description,
                severity:
                    modifiersTerminology.severity[record.problem.severity]
                        .description,
                priorityKey: record.problem.isHighPriority
                    ? "highPriorityDescription"
                    : "lowPriorityDescription"
            };

            record.interventions = record.interventions.map(intervention => {
                let categoryTerminology = categoriesTerminology.find(
                    categoryTerminology =>
                        categoryTerminology.code == intervention.category.id
                );

                if (categoryTerminology) {
                    intervention.category.title = categoryTerminology.title;
                    intervention.category.description =
                        categoryTerminology.description;
                }

                let targetTerminology = targetsTerminology.find(
                    targetTerminology =>
                        targetTerminology.code == intervention.target.id
                );

                if (targetTerminology) {
                    intervention.target.title = targetTerminology.title;
                    intervention.target.description =
                        targetTerminology.description;
                }

                return intervention;
            });

            // record.outcomes = record.outcomes.map(outcome => {
            //   outcome.knowledge.title = knowledgeTerminology.title;
            //   outcome.knowledge.description = knowledgeTerminology.description;
            //   outcome.behaviour.title = behaviourTerminology.title;
            //   outcome.behaviour.description = behaviourTerminology.description;
            //   outcome.status.title = statusTerminology.title;
            //   outcome.status.description = statusTerminology.description;
            //   return outcome;
            // });

            return record;
        });
    },

    flattenedProblems: function(terminology: Terminology): Problem[] {
        return terminology.problemClassificationScheme.domains
            .map(domain => domain.problems)
            .reduce(
                (previous, current) => previous.concat(current),
                [] as Problem[]
            );
    }
};
