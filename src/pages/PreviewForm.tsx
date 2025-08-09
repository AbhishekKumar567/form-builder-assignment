import React, { useEffect, useState } from "react";
import {
  Box, Paper, Typography, TextField, Button,
  Checkbox, RadioGroup, FormControlLabel, Radio,
  Select, MenuItem, FormControl, FormLabel, FormGroup
} from "@mui/material";
import { useAppSelector } from "../redux/hooks";
import { Field } from "../types";
import { useParams, useNavigate } from "react-router-dom";
import { loadSavedForms } from "../utils/localStorage";
import { evaluateFormula } from "../utils/evaluator";

type ErrorMap = Record<string, string | undefined>;

export default function PreviewForm() {
  const navigate = useNavigate();
  const reduxForm = useAppSelector(s => s.form);
  const { id } = useParams<{ id?: string }>();

  const [schema, setSchema] = useState<Field[]>([]);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<ErrorMap>({});

  useEffect(() => {
    if (reduxForm.fields.length > 0 && !id) {
      setSchema(reduxForm.fields);
    } else if (id) {
      const saved = loadSavedForms().find(s => s.id === id);
      if (saved) {
        setSchema(saved.schema);
        const init: Record<string, any> = {};
        saved.schema.forEach(f => { init[f.id] = f.defaultValue ?? "" });
        setValues(init);
      } else {
        navigate("/myforms");
      }
    } else {
      setSchema([]);
    }
  }, [reduxForm.fields, id, navigate]);

  useEffect(() => {
    if (schema.length > 0) {
      const init: Record<string, any> = {};
      schema.forEach(f => { init[f.id] = f.defaultValue ?? "" });
      setValues(prev => ({ ...init, ...prev }));
    }
  }, [schema]);

  useEffect(() => {
    const derivedFields = schema.filter(s => s.type === "derived");
    if (derivedFields.length === 0) return;

    let changed = false;
    const nextValues = { ...values };

    derivedFields.forEach(df => {
      const formula = df.formula || "";
      const newVal = evaluateFormula(formula, nextValues);
      if (nextValues[df.id] !== newVal) {
        nextValues[df.id] = newVal;
        changed = true;
      }
    });

    if (changed) setValues(nextValues);
  }, [values, schema]);

  const validateField = (f: Field, v: any): string | undefined => {
    const val = v;
    const rules = f.validations;
    if (!rules) return undefined;

    if (rules.notEmpty && (val === "" || val === null || val === undefined)) {
      return "Cannot be empty";
    }
    if (typeof val === "string") {
      if (rules.minLength !== undefined && val.length < rules.minLength) return `Minimum length ${rules.minLength}`;
      if (rules.maxLength !== undefined && val.length > rules.maxLength) return `Maximum length ${rules.maxLength}`;
      if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Invalid email";
      if (rules.passwordRule) {
        if (val.length < 8) return "Password must be at least 8 characters";
        if (!/\d/.test(val)) return "Password must contain at least one number";
      }
    }
    return undefined;
  };

  const handleChange = (id: string, value: any) => {
    setValues(prev => ({ ...prev, [id]: value }));
    setErrors(prev => ({ ...prev, [id]: undefined }));
  };

  const runAllValidations = (): boolean => {
    const e: ErrorMap = {};
    let ok = true;
    schema.forEach(f => {
      if (f.type === "derived") return;
      const err = validateField(f, values[f.id]);
      if (err) {
        e[f.id] = err;
        ok = false;
      }
    });
    setErrors(e);
    return ok;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!runAllValidations()) {
      alert("Fix validation errors.");
      return;
    }
    alert("Form is valid — submitted (not saved).");
  };

  if (!schema.length) {
    return (
      <Box p={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">No form to preview</Typography>
          <Typography sx={{ mt: 1 }}>
            Create a form at <Button onClick={() => navigate("/create")}>/create</Button> or go to <Button onClick={() => navigate("/myforms")}>/myforms</Button>.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Form Preview</Typography>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            {schema.map(f => {
              const value = values[f.id] ?? "";
              const error = errors[f.id];

              if (["text", "number", "date", "textarea"].includes(f.type)) {
                return (
                  <Box key={f.id}>
                    <Typography variant="subtitle2">{f.label} {f.required ? "*" : ""}</Typography>
                    <TextField
                      fullWidth
                      value={value}
                      multiline={f.type === "textarea"}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      onChange={(e) => handleChange(f.id, e.target.value)}
                      helperText={error}
                      error={!!error}
                    />
                  </Box>
                );
              }

              if (f.type === "select") {
                return (
                  <Box key={f.id}>
                    <FormControl fullWidth>
                      <FormLabel>{f.label}</FormLabel>
                      <Select value={value} onChange={(e) => handleChange(f.id, e.target.value)}>
                        <MenuItem value="">--select--</MenuItem>
                        {(f.options || []).map(o => <MenuItem key={o.id} value={o.value}>{o.label}</MenuItem>)}
                      </Select>
                      {error && <Typography color="error">{error}</Typography>}
                    </FormControl>
                  </Box>
                );
              }

              if (f.type === "radio") {
                return (
                  <Box key={f.id}>
                    <FormLabel>{f.label}</FormLabel>
                    <RadioGroup value={value} onChange={(e) => handleChange(f.id, e.target.value)}>
                      {(f.options || []).map(o => (
                        <FormControlLabel key={o.id} value={o.value} control={<Radio />} label={o.label} />
                      ))}
                    </RadioGroup>
                    {error && <Typography color="error">{error}</Typography>}
                  </Box>
                );
              }

              if (f.type === "checkbox") {
                const arr: string[] = Array.isArray(value) ? value : [];
                const toggle = (val: string) => {
                  const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
                  handleChange(f.id, next);
                };
                return (
                  <Box key={f.id}>
                    <FormLabel>{f.label}</FormLabel>
                    <FormGroup>
                      {(f.options || []).map(o => (
                        <FormControlLabel
                          key={o.id}
                          control={<Checkbox checked={arr.includes(o.value)} onChange={() => toggle(o.value)} />}
                          label={o.label}
                        />
                      ))}
                    </FormGroup>
                    {error && <Typography color="error">{error}</Typography>}
                  </Box>
                );
              }

              if (f.type === "derived") {
                return (
                  <Box key={f.id}>
                    <Typography variant="subtitle2">{f.label} (derived)</Typography>
                    <TextField fullWidth value={values[f.id] ?? ""} InputProps={{ readOnly: true }} />
                  </Box>
                );
              }

              return null;
            })}
            <Box display="flex" gap={2} mt={2}>
              <Button type="submit" variant="contained">Submit</Button>
              <Button variant="outlined" onClick={() => navigate("/create")}>Back to Create</Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
