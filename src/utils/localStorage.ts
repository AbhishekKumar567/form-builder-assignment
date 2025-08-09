import { Field } from "../types";

const STORAGE_KEY = "saved_forms_v1";

export interface SavedForm {
  id: string;
  name: string;
  createdAt: string;
  schema: Field[];
}

export function loadSavedForms(): SavedForm[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFormToStorage(form: SavedForm) {
  const cur = loadSavedForms();
  cur.push(form);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cur));
}
