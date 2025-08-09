
// common types for form schema
export type FieldType = "text" | "number" | "textarea" | "select" | "radio" | "checkbox" | "date" | "derived";

export interface ValidationRules {
  notEmpty?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  passwordRule?: boolean; 
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  defaultValue?: string;
  validations?: ValidationRules;
  // for select/radio/checkbox
  options?: FieldOption[];
  // for derived
  parentFieldIds?: string[];
  formula?: string;
}
