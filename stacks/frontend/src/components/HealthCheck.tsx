import { useState } from "react";
import { api } from "../api";
import styles from "./HealthCheck.module.css";

type HealthState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; status: string; timestamp: string }
  | { kind: "error"; message: string };

export function HealthCheck() {
  const [state, setState] = useState<HealthState>({ kind: "idle" });

  async function handleHealthCheck() {
    setState({ kind: "loading" });
    try {
      const result = await api.healthz();
      setState({
        kind: "success",
        status: result.status,
        timestamp: result.timestamp,
      });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.serviceInfo}>
            <span className={styles.serviceIcon} aria-hidden="true">
              ⚙
            </span>
            <div>
              <h3 className={styles.serviceName}>Backend API</h3>
              <p className={styles.serviceEndpoint}>/healthz</p>
            </div>
          </div>

          {state.kind === "success" && (
            <span className={styles.badgeSuccess}>Healthy</span>
          )}
          {state.kind === "error" && (
            <span className={styles.badgeError}>Unreachable</span>
          )}
          {state.kind === "idle" && (
            <span className={styles.badgeIdle}>Not checked</span>
          )}
          {state.kind === "loading" && (
            <span className={styles.badgeLoading}>
              <span className={styles.spinner} aria-hidden="true" />
              Checking...
            </span>
          )}
        </div>

        {state.kind === "success" && (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.detailValue}>{state.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Timestamp</span>
              <span className={`${styles.detailValue} ${styles.mono}`}>
                {state.timestamp}
              </span>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className={styles.errorBox}>
            <p>{state.message}</p>
          </div>
        )}

        <button
          type="button"
          className={styles.checkBtn}
          onClick={handleHealthCheck}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Checking..." : "Run Health Check"}
        </button>
      </div>
    </div>
  );
}
