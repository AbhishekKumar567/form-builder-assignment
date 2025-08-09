import React, { useState, useEffect } from "react";
import { Field, FieldOption } from "../types";
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";

interface FieldEditorProps {
  field: Field;
  allFields: Field[];
  onSave: (f: Field) => void;
  onCancel: () => void;
}

export default function FieldEditor({
  field,
  allFields,
  onSave,
  onCancel,
}: FieldEditorProps) {
  // Helper: convert IDs in formula to labels for editing display
  function idsToLabels(formula: string, fields: Field[]) {
    return formula.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, id) => {
      const match = fields.find((f) => f.id === id);
      return match ? `{{${match.label}}}` : `{{${id}}}`;
    });
  }

  // Helper: convert labels back to IDs before saving
  function labelsToIds(formula: string, fields: Field[]) {
    return formula.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, label) => {
      const match = fields.find((f) => f.label === label);
      return match ? `{{${match.id}}}` : `{{${label}}}`;
    });
  }

  const [draft, setDraft] = useState<Field>({ ...field });

  // Local state for user-friendly formula (with labels)
  const [localFormula, setLocalFormula] = useState<string>(() =>
    idsToLabels(field.formula || "", allFields)
  );

  // Sync local formula when field.formula or allFields change (e.g. on load)
  useEffect(() => {
    setLocalFormula(idsToLabels(field.formula || "", allFields));
  }, [field.formula, allFields]);

  const set = (patch: Partial<Field>) => setDraft((prev) => ({ ...prev, ...patch }));

  const addOption = () => {
    const o: FieldOption = {
      id: uuidv4(),
      label: "New option",
      value: `opt_${Math.random().toString(36).slice(2, 7)}`,
    };
    set({ options: [...(draft.options || []), o] });
  };
  const updateOption = (id: string, key: keyof FieldOption, value: string) => {
    set({
      options: (draft.options || []).map((o) =>
        o.id === id ? { ...o, [key]: value } : o
      ),
    });
  };
  const removeOption = (id: string) => {
    set({ options: (draft.options || []).filter((o) => o.id !== id) });
  };

  // Save handler converts labels back to IDs
  const handleSave = () => {
    const formulaWithIds = labelsToIds(localFormula, allFields);
    onSave({
      ...draft,
      formula: formulaWithIds,
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField
        label="Label"
        fullWidth
        value={draft.label}
        onChange={(e) => set({ label: e.target.value })}
      />
      <FormControlLabel
        control={
          <Switch
            checked={draft.required}
            onChange={(e) => set({ required: e.target.checked })}
          />
        }
        label="Required"
      />
      <TextField
        label="Default value"
        fullWidth
        value={draft.defaultValue || ""}
        onChange={(e) => set({ defaultValue: e.target.value })}
      />

      {/* validations */}
      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle2">Validation rules</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={!!draft.validations?.notEmpty}
              onChange={(e) =>
                set({
                  validations: {
                    ...(draft.validations || {}),
                    notEmpty: e.target.checked,
                  },
                })
              }
            />
          }
          label="Not empty"
        />
        <TextField
          type="number"
          label="Min length"
          value={(draft.validations?.minLength ?? "") as any}
          onChange={(e) =>
            set({
              validations: {
                ...(draft.validations || {}),
                minLength: e.target.value ? Number(e.target.value) : undefined,
              },
            })
          }
        />
        <TextField
          type="number"
          label="Max length"
          value={(draft.validations?.maxLength ?? "") as any}
          onChange={(e) =>
            set({
              validations: {
                ...(draft.validations || {}),
                maxLength: e.target.value ? Number(e.target.value) : undefined,
              },
            })
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!draft.validations?.email}
              onChange={(e) =>
                set({
                  validations: {
                    ...(draft.validations || {}),
                    email: e.target.checked,
                  },
                })
              }
            />
          }
          label="Email format"
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!draft.validations?.passwordRule}
              onChange={(e) =>
                set({
                  validations: {
                    ...(draft.validations || {}),
                    passwordRule: e.target.checked,
                  },
                })
              }
            />
          }
          label="Password rule (min 8 + number)"
        />
      </Paper>

      {/* options */}
      {(draft.type === "select" ||
        draft.type === "radio" ||
        draft.type === "checkbox") && (
        <Paper sx={{ p: 1 }}>
          <Typography variant="subtitle2">Options</Typography>
          {(draft.options || []).map((o) => (
            <Box
              key={o.id}
              display="flex"
              gap={1}
              alignItems="center"
              sx={{ my: 1 }}
            >
              <TextField
                value={o.label}
                onChange={(e) => updateOption(o.id, "label", e.target.value)}
                size="small"
              />
              <TextField
                value={o.value}
                onChange={(e) => updateOption(o.id, "value", e.target.value)}
                size="small"
              />
              <IconButton onClick={() => removeOption(o.id)}>
                <span style={{ fontSize: 16 }}>✖</span>
              </IconButton>
            </Box>
          ))}
          <Button onClick={addOption}>Add option</Button>
        </Paper>
      )}

      {/* derived */}
      {draft.type === "derived" && (
        <Paper sx={{ p: 1 }}>
          <Typography variant="subtitle2">Derived Field</Typography>
          <Typography variant="caption" color="textSecondary">
            Select parent fields and define a formula. Use placeholders like{" "}
            <code>{`{{fieldLabel}}`}</code> in formula, or use multiple
            placeholders and math operators.
          </Typography>
          <Box mt={1} display="flex" gap={1} flexWrap="wrap">
            {allFields
              .filter((f) => f.id !== draft.id)
              .map((f) => (
                <Button
                  key={f.id}
                  variant={
                    draft.parentFieldIds?.includes(f.id) ? "contained" : "outlined"
                  }
                  onClick={() => {
                    const arr = draft.parentFieldIds || [];
                    if (arr.includes(f.id))
                      set({ parentFieldIds: arr.filter((id) => id !== f.id) });
                    else set({ parentFieldIds: [...arr, f.id] });
                  }}
                >
                  {f.label}
                </Button>
              ))}
          </Box>
          <TextField
            label="Formula"
            fullWidth
            multiline
            value={localFormula}
            onChange={(e) => setLocalFormula(e.target.value)}
            placeholder="Example: ({{dob}} ? Math.floor((Date.now() - new Date({{dob}}).getTime())/(365*24*60*60*1000)) : '')"
          />
        </Paper>
      )}

      <Box display="flex" gap={1} justifyContent="flex-end" mt={1}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
