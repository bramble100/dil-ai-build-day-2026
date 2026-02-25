import { HealthCheck } from "./components/HealthCheck";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.app}>
      <h1>AI Quiz App</h1>
      <HealthCheck />
    </div>
  );
}

export default App;
