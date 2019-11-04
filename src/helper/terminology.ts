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
  makeIds: function(terminology: Terminology) {
    terminology.problemClassificationScheme.domains.forEach(domain => {
      domain.id = "D." + domain.code;
      domain.problems.forEach(problem => {
        problem.id = "P." + problem.code;
        problem.signsAndSymptoms.forEach(symptom => {
          symptom.id = problem.code + "." + symptom.code;
        });
      });
    });

    return terminology;
  },

  treeify: function(list: any[], key: string): any {
    let lastIndex = list.length - 1;
    return list.map((item, index) => {
      let result: any = {
        id: item.id || item.code,
        title: item.title,
        label: item.title,
        value: item.id || item.code,
        description: item.description,
        type: key,
        header: key,
        body: key,
        selectable: key == "problems",
        isLast: index == lastIndex
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
  }
};
