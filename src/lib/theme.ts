import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      dark: "#007bff",
      main: "#0091EA",
      light: "#B2EBF2",
      contrastText: "#fff",
    },
    secondary: { main: "#3333339f", light: "gainsboro" },
    success: {
      main: "#28a745",
      light: "#4caf4fcb",
      contrastText: "#fff",
    },
    warning: {
      main: "#ffc107",
      light: "#EF9A9A",
      contrastText: "#000",
    },
    error: {
      main: "#dc3545",
      dark: "#c62828e1",
      contrastText: "#fff",
    },
    background: {
      default: "#f8f9fa",
      paper: "#fff",
    },
  },
});

export default theme;
