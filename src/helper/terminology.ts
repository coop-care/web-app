export interface Titleable {
  title: string;
}
export interface Describable {
  description: string;
}
export interface TitleAndDescribable extends Titleable, Describable {}

export interface Terminology extends Titleable {
  problemClassificationScheme: ProblemClassificationScheme;
  interventionScheme: InterventionScheme;
  problemRatingScale: ProblemRatingScale;
}
export interface ProblemClassificationScheme extends Titleable {
  domains: Domain[];
  modifiers: {
    scope: TitleAndDescribable[];
    severity: TitleAndDescribable[];
  };
}
export interface Domain extends TitleAndDescribable {
  problems: Problem[];
}
export interface Problem extends TitleAndDescribable {
  signsAndSymptoms: Titleable;
}
export interface InterventionScheme extends Titleable {
  categories: TitleAndDescribable[];
  targets: TitleAndDescribable[];
}
export interface ProblemRatingScale extends Titleable {
  ratings: Rating[];
}
export interface Rating extends TitleAndDescribable {
  scale: Titleable[];
}

export default {
  autoId: 0,

  filter: function(node: TitleAndDescribable, filter: string) {
    let regex = new RegExp(
      "(^|\\b)" + filter.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
      "gi"
    );
    return (
      (node.title && node.title.match(regex)) ||
      (node.description && node.description.match(regex))
    );
  },

  treeify: function(list: any[], key: string): any {
    let lastIndex = list.length - 1;
    return list.map((item, index) => {
      let autoId = ++this.autoId;
      let result: any = {
        id: autoId,
        title: item.title,
        label: item.title,
        value: autoId,
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

  sortByTitle: function(a: Titleable, b: Titleable): number {
    return a.title.localeCompare(b.title);
  }
};
