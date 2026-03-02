import { useState } from "react";
import { api } from "../api";
import styles from "./HealthCheck.module.css";

export function HealthCheck() {
  const [output, setOutput] = useState("");

  async function handleHealthCheck() {
    setOutput("Calling API...");

    try {
      const text = await api.healthz();
      setOutput(text);
    } catch (err) {
      setOutput("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  return (
    <div>
      <button type="button" onClick={handleHealthCheck}>
        Check API Health
      </button>
      {output && <pre className={styles.output}>{output}</pre>}
    </div>
  );
}
