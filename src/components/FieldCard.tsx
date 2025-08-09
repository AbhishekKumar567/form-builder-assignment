import React from "react";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Field } from "../types";

export default function FieldCard({ field, index, onEdit, onDelete, onUp, onDown }: {
  field: Field;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  return (
    <Card variant="outlined">
      <CardContent style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="subtitle1">{field.label} <small style={{color: '#666'}}>({field.type})</small></Typography>
          <Typography variant="body2" color="textSecondary">
            {field.required ? "Required" : "Optional"} • {field.type === "derived" ? `Derived (formula: ${field.formula || "-"})` : ""}
          </Typography>
        </Box>
        <Box>
          <IconButton onClick={onUp} title="Move up" disabled={index === 0}><ArrowUpwardIcon /></IconButton>
          <IconButton onClick={onDown} title="Move down"><ArrowDownwardIcon /></IconButton>
          <IconButton onClick={onEdit}><EditIcon /></IconButton>
          <IconButton onClick={onDelete}><DeleteIcon /></IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}
