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
