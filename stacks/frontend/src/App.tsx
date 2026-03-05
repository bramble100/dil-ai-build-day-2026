import { Routes, Route, Link, useLocation } from "react-router";
import { Home } from "./pages/Home";
import { Health } from "./pages/Health";
import { Quiz } from "./pages/Quiz";
import styles from "./App.module.css";

function App() {
  const location = useLocation();

  const navItems = [
    { to: "/quiz", label: "Create Quiz" },
    { to: "/health", label: "API Status" },
  ];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon} aria-hidden="true">
            ✦
          </span>
          <span className={styles.logoText}>QuizAI</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`${styles.navLink} ${
                location.pathname === to ? styles.navLinkActive : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/health" element={<Health />} />
          <Route path="/quiz" element={<Quiz />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
