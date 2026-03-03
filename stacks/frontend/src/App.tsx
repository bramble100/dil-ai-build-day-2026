import { Routes, Route } from "react-router";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Home } from "./pages/Home";
import { Health } from "./pages/Health";
import { Quiz } from "./pages/Quiz";
import styles from "./App.module.css";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3d7a4f",
      light: "#5a9e6a",
      dark: "#2e5e3c",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8b6340",
      light: "#b08560",
      dark: "#6a4a2e",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f7f3ec",
      paper: "#ffffff",
    },
    text: {
      primary: "#2c2416",
      secondary: "#6b5d4e",
    },
    divider: "#d9cfc3",
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
