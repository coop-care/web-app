
export type CustomField<T> = {
  label: string;
  value: T;
  dataType?: string;
};

export type LabeledValue<T> = {
  label: string;
  value: T;
};
