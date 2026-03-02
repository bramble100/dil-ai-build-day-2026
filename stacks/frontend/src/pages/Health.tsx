import { HealthCheck } from "../components/HealthCheck";
import styles from "./Health.module.css";

export function Health() {
  return (
    <div className={styles.health}>
      <h1>API Health</h1>
      <HealthCheck />
    </div>
  );
}
