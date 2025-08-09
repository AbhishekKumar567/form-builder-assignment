import React, { useState } from "react";
import { Box, Paper, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addField, updateField, removeField, moveFieldUp, moveFieldDown, setFormName, resetForm } from "../redux/formSlice";
import { Field, FieldType } from "../types";
import { v4 as uuidv4 } from "uuid";
import FieldEditor from "../components/FieldEditor";
import FieldCard from "../components/FieldCard";
import { saveFormToStorage } from "../utils/localStorage";
import dayjs from "dayjs";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "textarea", label: "Textarea" },
  { value: "select", label: "Select" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
  { value: "derived", label: "Derived Field" }
];

export default function CreateForm() {
  const dispatch = useAppDispatch();
  const { fields, formName } = useAppSelector(s => s.form);

  // initially empty — forces user to pick a field type
  const [addingType, setAddingType] = useState<FieldType | "">("");
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [localFormName, setLocalFormName] = useState(formName || "");

  function createEmptyField(type: FieldType): Field {
    return {
      id: uuidv4(),
      type,
      label: type === "derived" ? "Derived Field" : `${type} field`,
      required: false,
      defaultValue: "",
      validations: {},
      options:
        type === "select" || type === "radio" || type === "checkbox"
          ? [
              { id: uuidv4(), label: "Option 1", value: "option1" },
              { id: uuidv4(), label: "Option 2", value: "option2" }
            ]
          : undefined,
      parentFieldIds: type === "derived" ? [] : undefined,
      formula: type === "derived" ? "{{}}" : undefined
    };
  }

  const handleAdd = () => {
    if (!addingType) return;
    const f = createEmptyField(addingType as FieldType);
    dispatch(addField(f));
    setEditingField(f);
    setAddingType(""); // reset to placeholder
  };

  const handleEditSave = (f: Field) => {
    dispatch(updateField(f));
    setEditingField(null);
  };

  const handleRemove = (id: string) => dispatch(removeField(id));
  const handleUp = (id: string) => dispatch(moveFieldUp(id));
  const handleDown = (id: string) => dispatch(moveFieldDown(id));

  const handleOpenSave = () => {
    setLocalFormName(formName || "");
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    const saved = {
      id: uuidv4(),
      name: localFormName || `Untitled ${dayjs().format("YYYY-MM-DD HH:mm")}`,
      createdAt: new Date().toISOString(),
      schema: fields
    };
    saveFormToStorage(saved);
    dispatch(resetForm());
    setSaveDialogOpen(false);
    alert("Form saved locally. Go to My Forms to preview it.");
  };

  return (
    <Box p={2}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Left Panel */}
        <Box flex={1} minWidth="280px">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Add Field</Typography>
            <TextField
              select
              fullWidth
              label="Field Type"
              value={addingType}
              onChange={(e) => setAddingType(e.target.value as FieldType)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="">Select any field from dropdown</MenuItem>
              {FIELD_TYPES.map(ft => (
                <MenuItem key={ft.value} value={ft.value}>
                  {ft.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleAdd}
              disabled={!addingType} // disabled until user selects a type
            >
              Add
            </Button>

            <Box mt={3}>
              <Typography variant="subtitle1">Form Name</Typography>
              <TextField
                fullWidth
                value={localFormName}
                onChange={(e) => {
                  setLocalFormName(e.target.value);
                  dispatch(setFormName(e.target.value));
                }}
                placeholder="Enter form name"
              />
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={handleOpenSave}
                disabled={fields.length === 0}
              >
                Save Form
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right Panel */}
        <Box flex={2} minWidth="280px">
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Form Fields</Typography>
            {fields.length === 0 && (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No fields yet. Add a field from the left panel.
              </Typography>
            )}
            <Box mt={2} display="flex" flexDirection="column" gap={2}>
              {fields.map((f, idx) => (
                <FieldCard
                  key={f.id}
                  field={f}
                  index={idx}
                  onEdit={() => setEditingField(f)}
                  onDelete={() => handleRemove(f.id)}
                  onUp={() => handleUp(f.id)}
                  onDown={() => handleDown(f.id)}
                />
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Edit Field Dialog */}
      <Dialog open={!!editingField} onClose={() => setEditingField(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Field</DialogTitle>
        <DialogContent>
          {editingField && (
            <FieldEditor
              field={editingField}
              allFields={fields}
              onSave={handleEditSave}
              onCancel={() => setEditingField(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Save Form Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Form</DialogTitle>
        <DialogContent>
          <TextField
            label="Form name"
            fullWidth
            value={localFormName}
            onChange={(e) => setLocalFormName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveConfirm}
            disabled={!localFormName && fields.length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
