import { useState } from "react";
import { API_BASE } from "../config";
import styles from "./HealthCheck.module.css";

export function HealthCheck() {
  const [output, setOutput] = useState("");

  async function handleHealthCheck() {
    setOutput("Calling API...");

    try {
      const res = await fetch(`${API_BASE}/healthz`);
      const text = await res.text();
      setOutput(`Status: ${res.status}\n\n${text}`);
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
