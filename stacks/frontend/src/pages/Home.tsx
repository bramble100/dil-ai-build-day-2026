import { Fragment } from "react";
import { Link } from "react-router";
import styles from "./Home.module.css";

const FEATURES = [
  {
    icon: "🧠",
    title: "AI-Powered Questions",
    description:
      "Generate unique, contextually relevant quiz questions on any topic using advanced AI.",
  },
  {
    icon: "🎯",
    title: "Adaptive Difficulty",
    description:
      "Choose from beginner to expert levels — questions scale to challenge any knowledge level.",
  },
  {
    icon: "⚡",
    title: "Instant Generation",
    description:
      "Get a complete quiz with explanations in seconds. No manual question writing needed.",
  },
];

const STEPS = [
  { label: "Pick a topic", icon: "💡" },
  { label: "Set difficulty & count", icon: "⚙️" },
  { label: "Generate & learn", icon: "🚀" },
];

export function Home() {
  return (
    <div className={styles.home}>
      {/* ── Hero ───────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} aria-hidden="true" />
          AI-Powered Quiz Generation
        </div>
        <h1 className={styles.heroTitle}>
          Create intelligent quizzes
          <span className={styles.heroGradient}>in seconds</span>
        </h1>
        <p className={styles.heroDescription}>
          Enter any topic and let AI craft perfectly tailored quiz questions with
          multiple difficulty levels and detailed explanations.
        </p>
        <div className={styles.heroCta}>
          <Link to="/quiz" className={styles.ctaMagic}>
            <span className={styles.ctaMagicBg} aria-hidden="true" />
            <span className={styles.ctaMagicContent}>
              Start Creating
              <span aria-hidden="true">→</span>
            </span>
          </Link>
          <Link to="/health" className={styles.ctaSecondary}>
            Check API Status
          </Link>
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className={styles.features}>
        <h2 className={styles.sectionLabel}>How it works</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <article key={feature.title} className={styles.featureCard}>
              <span className={styles.featureIcon} aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className={styles.featureCardTitle}>{feature.title}</h3>
              <p className={styles.featureCardDescription}>
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Steps ──────────────────────────────────── */}
      <section className={styles.steps}>
        <h2 className={styles.sectionLabel}>Three simple steps</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((step, i) => (
            <Fragment key={step.label}>
              <div className={styles.step}>
                <span className={styles.stepIcon} aria-hidden="true">
                  {step.icon}
                </span>
                <span className={styles.stepNumber}>Step {i + 1}</span>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={styles.stepArrow} aria-hidden="true">
                  →
                </span>
              )}
            </Fragment>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────── */}
      <section className={styles.bottomCta}>
        <h2 className={styles.bottomCtaTitle}>Ready to test your knowledge?</h2>
        <p className={styles.bottomCtaDescription}>
          Create your first AI-powered quiz in seconds — no signup required.
        </p>
        <Link to="/quiz" className={styles.ctaMagic}>
          <span className={styles.ctaMagicBg} aria-hidden="true" />
          <span className={styles.ctaMagicContent}>
            Create a Quiz
            <span aria-hidden="true">✦</span>
          </span>
        </Link>
      </section>
    </div>
  );
}
