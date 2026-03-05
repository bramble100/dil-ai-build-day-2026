import { Link } from "react-router";
import styles from "./Quiz.module.css";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];

export function Quiz() {
  return (
    <div className={styles.quiz}>
      <Link to="/" className={styles.back}>← Back</Link>
      <h1>Create a Quiz</h1>
      <p className={styles.subtitle}>Enter a topic and let AI craft your quiz.</p>

      <form className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            placeholder="Choose a topic"
            maxLength={100}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty">
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="count">Questions: <strong>5</strong></label>
          <input id="count" type="range" min={1} max={20} defaultValue={5} />
          <div className={styles.rangeLabels}>
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <button type="submit" className={styles.submit}>
          Generate Quiz
        </button>
      </form>
    </div>
  );
}
