import { useState } from "react";
import { Link } from "react-router";
import { api } from "../api";
import styles from "./Quiz.module.css";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];

export function Quiz() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.createQuiz({ topic, difficulty, count });
      console.log("Generated quiz:", result.quiz);
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.quiz}>
      <Link to="/" className={styles.back}>← Back</Link>
      <h1>Create a Quiz</h1>
      <p className={styles.subtitle}>Enter a topic and let AI craft your quiz.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="topic">Topic</label>
          <input
            id="topic"
            type="text"
            placeholder="e.g. Quantum Physics, World War II, TypeScript..."
            maxLength={100}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="count">Questions: <strong>{count}</strong></label>
          <input
            id="count"
            type="range"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
          <div className={styles.rangeLabels}>
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? "Generating..." : "Generate Quiz"}
        </button>
      </form>
    </div>
  );
}
