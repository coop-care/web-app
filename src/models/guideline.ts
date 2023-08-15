import { toRaw } from "vue";
import { mergeDeep } from "src/helper/utils";

export type Guideline = {
  schema: number;
  id: string;
  locale: string;
  versionDate: Date;
  title: string;
  description?: string;
  license?: string;
  licenseText?: string;
  copyright?: string;
  url?: string;
  population?: string;
  diseasesOrCondition?: string;
  practiceSetting?: string;
  levelsOfPractice?: string;
  revisionDate?: Date;
  encodedBy?: string;
  encodedDate?: Date;
  translationDate?: Date;
  translatedBy?: string;
  contributors?: string;
  organizations?: string;
  sources?: string;
  problems: {
    [key: string]: {
      severityModifierExamples?: string[];
      problemRatingScaleExamples?: {
        ratings: {
          scale: {
            title: string;
          }[];
        }[];
      };
      interventionSuggestions?: {
        [key: string]: {
          [key: string]: {
            [key: string]: string;
          };
        };
      };
    };
  };
};

function hasSuggestions(interventionSuggestions: Record<string, Record<string, any>> = {}) {
  return Object.values(interventionSuggestions)
    .filter(item=> 
      Object.values(item).filter(item => Object.values(item).length > 0).length > 0
    ).length > 0
}

export function hasInterventionSuggestions(guidelines: Record<string, Guideline>, problemCode: string) {
  return Object.values(guidelines).find(guideline => 
    hasSuggestions(guideline.problems[problemCode]?.interventionSuggestions)
  ) != undefined;
}

/**
 * Find suggested interventions in provided Omaha System guidelines for a specific Omaha System problem
 * @param guidelines 
 * @param problemCode 
 * @returns undefined if no intervention suggestions exist, 
 * otherwise a merged map of intervention suggestions from all provided guidelines
 */
export function interventionSuggestions(guidelines: Record<string, Guideline>, problemCode: string) {
  const interventionSuggestionsList = Object.values(guidelines).map(guideline => {
    const problem = toRaw(guideline.problems[problemCode || ""]);
    const interventionSuggestions = structuredClone(problem?.interventionSuggestions) || {};

    Object.values(interventionSuggestions).forEach(category => {
      Object.entries(category).forEach(([targetCode, target]) => {
        const newTarget = {} as Record<string, string>;
        Object.entries(target).forEach(([detailsCode, details]) => 
          newTarget[guideline.id + "." + detailsCode] = details
        )
        category[targetCode] = newTarget;
      });
    });

    return interventionSuggestions;
  });

  const result = mergeDeep<typeof interventionSuggestionsList[0]>(...interventionSuggestionsList);

  if (hasSuggestions(result)) {
    return result;
  } else {
    return undefined;
  }
}

/**
 * Find severity modifier example texts in provided Omaha System guidelines for a specific Omaha System problem
 * @param guidelines 
 * @param problemCode 
 * @returns a list of three example texts for each severity value that can be empty if none exists
 */
export function severityModifierExamples(guidelines: Record<string, Guideline>, problemCode: string) {
  return guidelines["UG"]?.problems[problemCode || ""]?.severityModifierExamples || [];
}

/**
 * Find problem rating scale example texts in provided Omaha System guidelines for a specific Omaha System problem
 * @param guidelines 
 * @param problemCode 
 * @returns A list of three objects for three rating types (knowledge, behaviour, status) 
 * with five example texts for each rating scale value. The result can be an empty list if no examples exist.
 */
export function problemRatingScaleExamples(guidelines: Record<string, Guideline>, problemCode: string) {
  return guidelines["UG"]?.problems[problemCode || ""]?.problemRatingScaleExamples?.ratings || [];
}
