import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import CreateForm from "./pages/CreateForm";
import PreviewForm from "./pages/PreviewForm";
import MyForms from "./pages/MyForms";
import { AppBar, Toolbar, Button } from "@mui/material";
import { loadSavedForms } from "./utils/localStorage";

function App() {
  const navigate = useNavigate();

  const handlePreviewClick = () => {
    const forms = loadSavedForms();
    if (forms.length > 0) {
      const latestForm = forms[forms.length - 1]; // last saved form
      navigate(`/preview/${latestForm.id}`);
    } else {
      navigate("/preview"); // fallback if no forms saved
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/create">Create</Button>
          <Button color="inherit" onClick={handlePreviewClick}>Preview</Button>
          <Button color="inherit" component={Link} to="/myforms">My Forms</Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/create" element={<CreateForm />} />
        <Route path="/preview" element={<PreviewForm />} />
        <Route path="/preview/:id" element={<PreviewForm />} />
        <Route path="/myforms" element={<MyForms />} />
      </Routes>
    </>
  );
}

export default function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}
