import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Field } from "../types";

interface FormState {
  fields: Field[];
  formName: string;
}

const initialState: FormState = {
  fields: [],
  formName: ""
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setFormName(state, action: PayloadAction<string>) {
      state.formName = action.payload;
    },
    setFields(state, action: PayloadAction<Field[]>) {
      state.fields = action.payload;
    },
    addField(state, action: PayloadAction<Field>) {
      state.fields.push(action.payload);
    },
    updateField(state, action: PayloadAction<Field>) {
      const idx = state.fields.findIndex(f => f.id === action.payload.id);
      if (idx >= 0) state.fields[idx] = action.payload;
    },
    removeField(state, action: PayloadAction<string>) {
      state.fields = state.fields.filter(f => f.id !== action.payload);
    },
    moveFieldUp(state, action: PayloadAction<string>) {
      const idx = state.fields.findIndex(f => f.id === action.payload);
      if (idx > 0) {
        const tmp = state.fields[idx - 1];
        state.fields[idx - 1] = state.fields[idx];
        state.fields[idx] = tmp;
      }
    },
    moveFieldDown(state, action: PayloadAction<string>) {
      const idx = state.fields.findIndex(f => f.id === action.payload);
      if (idx >= 0 && idx < state.fields.length - 1) {
        const tmp = state.fields[idx + 1];
        state.fields[idx + 1] = state.fields[idx];
        state.fields[idx] = tmp;
      }
    },
    resetForm(state) {
      state.fields = [];
      state.formName = "";
    }
  }
});

export const {
  setFormName,
  addField,
  updateField,
  removeField,
  moveFieldUp,
  moveFieldDown,
  setFields,
  resetForm
} = formSlice.actions;

export default formSlice.reducer;
