export type ProductCategoryRow = {
  id: string;
  label: string;
  sort_order: number;
  active: boolean;
};

export type VariantKindDefinitionRow = {
  id: string;
  label: string;
  hint: string | null;
  ui_behavior: "color" | "storage" | "select";
  sort_order: number;
  active: boolean;
};

export type VariantPricingModeLabelRow = {
  mode: "absolute" | "delta";
  label: string;
  hint: string | null;
};
