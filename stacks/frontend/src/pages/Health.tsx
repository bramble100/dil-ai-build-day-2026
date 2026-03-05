import { Link } from "react-router";
import { HealthCheck } from "../components/HealthCheck";
import styles from "./Health.module.css";

export function Health() {
  return (
    <div className={styles.health}>
      <div className={styles.header}>
        <h1>API Status</h1>
        <p className={styles.subtitle}>
          Check the health and availability of the backend API service.
        </p>
      </div>
      <HealthCheck />
      <div className={styles.cta}>
        <p className={styles.ctaText}>Everything looking good?</p>
        <Link to="/quiz" className={styles.ctaLink}>
          Create a Quiz <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
