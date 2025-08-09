import React, { useEffect, useState } from "react";
import { loadSavedForms } from "../utils/localStorage";
import { Box, Paper, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function MyForms() {
  const [forms, setForms] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setForms(loadSavedForms());
  }, []);

  if (forms.length === 0) {
    return (
      <Box p={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">No saved forms</Typography>
          <Typography sx={{ mt: 1 }}>Create and save a form from /create.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Saved Forms</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          {forms.map(f => (
            <Box key={f.id} display="flex" justifyContent="space-between" alignItems="center" p={2} border="1px solid #ccc" borderRadius={1}>
              <Box>
                <Typography variant="subtitle1">{f.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(f.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Button onClick={() => navigate(`/preview/${f.id}`)}>Open</Button>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
