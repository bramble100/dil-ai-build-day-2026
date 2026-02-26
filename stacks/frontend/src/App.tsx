import { Routes, Route } from "react-router";
import { Home } from "./pages/Home";
import { Health } from "./pages/Health";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/health" element={<Health />} />
      </Routes>
    </div>
  );
}

export default App;
