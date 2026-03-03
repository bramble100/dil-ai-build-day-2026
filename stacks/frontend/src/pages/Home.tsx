import { Link } from "react-router";
import styles from "./Home.module.css";

export function Home() {
  return (
    <div className={styles.home}>
      <h1>Quiz app</h1>
      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to="/quiz">Create Quiz</Link>
        <Link to="/health">Check API</Link>
      </nav>
    </div>
  );
}
