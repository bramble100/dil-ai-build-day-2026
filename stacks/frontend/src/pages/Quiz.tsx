import { useState } from "react";
import { api } from "../api";
import type { Quiz as QuizType, QuizEvaluation } from "../api";
import styles from "./Quiz.module.css";

const DIFFICULTIES = [
  { value: "beginner", label: "Beginner", icon: "🌱" },
  { value: "intermediate", label: "Intermediate", icon: "📚" },
  { value: "advanced", label: "Advanced", icon: "🔬" },
  { value: "expert", label: "Expert", icon: "🧠" },
];

type ViewState =
  | { kind: "form" }
  | { kind: "loading" }
  | { kind: "quiz"; quiz: QuizType }
  | { kind: "evaluating"; quiz: QuizType }
  | { kind: "result"; quiz: QuizType; evaluation: QuizEvaluation }
  | { kind: "error"; message: string };

function getOverallFeedback(correct: number, total: number): string {
  if (total === 0) return "";
  const pct = (correct / total) * 100;
  if (pct === 100)
    return "Perfect score! You have an outstanding command of this topic.";
  if (pct >= 80)
    return "Excellent work! You clearly have a strong understanding of this material.";
  if (pct >= 60)
    return "Good job! You have solid foundations — review the explanations to fill the gaps.";
  if (pct >= 40)
    return "Nice effort! Go through the explanations to strengthen your knowledge.";
  return "Keep learning! Review the explanations below to build a stronger foundation.";
}

export function Quiz() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [count, setCount] = useState(5);
  const [view, setView] = useState<ViewState>({ kind: "form" });
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setView({ kind: "loading" });
    try {
      const result = await api.createQuiz({ topic, difficulty, count });
      setSelectedAnswers({});
      setView({ kind: "quiz", quiz: result.quiz });
    } catch (err) {
      setView({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  };

  const selectAnswer = (questionId: string, choiceKey: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: choiceKey }));
  };

  const handleEvaluate = async () => {
    if (view.kind !== "quiz") return;
    const quiz = view.quiz;
    setView({ kind: "evaluating", quiz });

    try {
      const answers = quiz.questions.map((q) => ({
        questionId: q.id,
        selectedChoice: selectedAnswers[q.id] ?? "",
      }));

      try {
        await api.submitQuiz(quiz.id, answers);
      } catch {
        /* submit may not be available yet */
      }

      let evaluation: QuizEvaluation;
      try {
        const result = await api.evaluateQuiz(quiz.id);
        evaluation = result.evaluation;
      } catch {
        evaluation = buildClientSideEvaluation(quiz, selectedAnswers);
      }

      setView({ kind: "result", quiz, evaluation });
    } catch (err) {
      setView({
        kind: "error",
        message: err instanceof Error ? err.message : "Evaluation failed",
      });
    }
  };

  const handleNewQuiz = () => {
    setView({ kind: "form" });
    setSelectedAnswers({});
  };

  return (
    <div className={styles.quiz}>
      {/* ── Form View ──────────────────────────────── */}
      {(view.kind === "form" || view.kind === "loading") && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1>Create a Quiz</h1>
            <p className={styles.subtitle}>
              Enter a topic and let AI craft your quiz.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleGenerate}>
            <div className={styles.field}>
              <label htmlFor="topic" className={styles.label}>
                Topic
              </label>
              <input
                id="topic"
                type="text"
                className={styles.input}
                placeholder="e.g. Cooking, TypeScript, Stoicism..."
                maxLength={100}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={view.kind === "loading"}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Difficulty</label>
              <div className={styles.difficultyGrid}>
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    className={`${styles.difficultyOption} ${
                      difficulty === d.value
                        ? styles.difficultyOptionActive
                        : ""
                    }`}
                    onClick={() => setDifficulty(d.value)}
                    disabled={view.kind === "loading"}
                  >
                    <span className={styles.difficultyIcon} aria-hidden="true">
                      {d.icon}
                    </span>
                    <span className={styles.difficultyLabel}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="count" className={styles.label}>
                Questions:{" "}
                <span className={styles.countValue}>{count}</span>
              </label>
              <input
                id="count"
                type="range"
                className={styles.range}
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={view.kind === "loading"}
              />
              <div className={styles.rangeLabels}>
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <button
              type="submit"
              className={styles.magicBtn}
              disabled={view.kind === "loading"}
            >
              <span className={styles.magicBtnBg} aria-hidden="true" />
              <span className={styles.magicBtnContent}>
                {view.kind === "loading" ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">✦</span>
                    Generate Quiz
                  </>
                )}
              </span>
            </button>
          </form>

          {view.kind === "loading" && (
            <div className={styles.loadingHint}>
              <p>AI is crafting your questions. This may take a moment...</p>
            </div>
          )}
        </div>
      )}

      {/* ── Quiz Taking View ───────────────────────── */}
      {(view.kind === "quiz" || view.kind === "evaluating") && (
        <QuizTaking
          quiz={view.quiz}
          selectedAnswers={selectedAnswers}
          onSelectAnswer={selectAnswer}
          onEvaluate={handleEvaluate}
          onNewQuiz={handleNewQuiz}
          isEvaluating={view.kind === "evaluating"}
        />
      )}

      {/* ── Result View ────────────────────────────── */}
      {view.kind === "result" && (
        <QuizResults
          quiz={view.quiz}
          evaluation={view.evaluation}
          selectedAnswers={selectedAnswers}
          onNewQuiz={handleNewQuiz}
        />
      )}

      {/* ── Error View ─────────────────────────────── */}
      {view.kind === "error" && (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon} aria-hidden="true">
            ✕
          </div>
          <h2>Something went wrong</h2>
          <p className={styles.errorMessage}>{view.message}</p>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={handleNewQuiz}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Quiz Taking Sub-Component ─────────────────────── */

function QuizTaking({
  quiz,
  selectedAnswers,
  onSelectAnswer,
  onEvaluate,
  onNewQuiz,
  isEvaluating,
}: {
  quiz: QuizType;
  selectedAnswers: Record<string, string>;
  onSelectAnswer: (questionId: string, choiceKey: string) => void;
  onEvaluate: () => void;
  onNewQuiz: () => void;
  isEvaluating: boolean;
}) {
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className={styles.quizContainer}>
      <div className={styles.quizHeader}>
        <div>
          <h1>{quiz.topic}</h1>
          <p className={styles.quizMeta}>
            {quiz.questions.length} questions ·{" "}
            {quiz.difficulty.charAt(0).toUpperCase() +
              quiz.difficulty.slice(1)}{" "}
            · {answeredCount}/{quiz.questions.length} answered
          </p>
        </div>
        <button
          type="button"
          className={styles.outlineBtn}
          onClick={onNewQuiz}
          disabled={isEvaluating}
        >
          New Quiz
        </button>
      </div>

      <div className={styles.questionList}>
        {quiz.questions.map((q, index) => (
          <article key={q.id} className={styles.questionCard}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>{index + 1}</span>
              <p className={styles.questionText}>{q.questionText}</p>
            </div>

            <div className={styles.choices}>
              {Object.entries(q.choices).map(([key, text]) => {
                const isSelected = selectedAnswers[q.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.choice} ${
                      isSelected ? styles.choiceSelected : ""
                    }`}
                    onClick={() => onSelectAnswer(q.id, key)}
                    disabled={isEvaluating}
                  >
                    <span
                      className={`${styles.choiceKey} ${
                        isSelected ? styles.choiceKeySelected : ""
                      }`}
                    >
                      {key}
                    </span>
                    <span>{text}</span>
                  </button>
                );
              })}
            </div>
          </article>
        ))}
      </div>

      <div className={styles.evaluateBar}>
        <button
          type="button"
          className={styles.magicBtn}
          onClick={onEvaluate}
          disabled={isEvaluating}
        >
          <span className={styles.magicBtnBg} aria-hidden="true" />
          <span className={styles.magicBtnContent}>
            {isEvaluating ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                Evaluating...
              </>
            ) : (
              <>
                <span aria-hidden="true">✦</span>
                Evaluate Quiz
              </>
            )}
          </span>
        </button>
        <p className={styles.evaluateHint}>
          {answeredCount === 0
            ? "Select your answers above, then evaluate."
            : answeredCount < quiz.questions.length
              ? `${quiz.questions.length - answeredCount} unanswered (counted as incorrect).`
              : "All questions answered!"}
        </p>
      </div>
    </div>
  );
}

/* ─── Quiz Results Sub-Component ────────────────────── */

function QuizResults({
  quiz,
  evaluation,
  selectedAnswers,
  onNewQuiz,
}: {
  quiz: QuizType;
  evaluation: QuizEvaluation;
  selectedAnswers: Record<string, string>;
  onNewQuiz: () => void;
}) {
  const total = quiz.questions.length;
  const correct = evaluation.correctAnswerCount;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const feedback =
    evaluation.overallFeedback || getOverallFeedback(correct, total);

  return (
    <div className={styles.resultContainer}>
      {/* Score Card */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreRing}>
          <svg viewBox="0 0 100 100" className={styles.scoreRingSvg}>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--color-surface-border)"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 264} 264`}
              transform="rotate(-90 50 50)"
              className={styles.scoreRingProgress}
            />
            <defs>
              <linearGradient
                id="scoreGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.scoreRingText}>
            <span className={styles.scorePct}>{pct}%</span>
          </div>
        </div>
        <div className={styles.scoreInfo}>
          <h2>
            {correct} / {total} Correct
          </h2>
          <p className={styles.scoreFeedback}>{feedback}</p>
        </div>
      </div>

      {/* Result Header */}
      <div className={styles.resultHeader}>
        <div>
          <h2>{quiz.topic}</h2>
          <p className={styles.quizMeta}>
            {total} questions ·{" "}
            {quiz.difficulty.charAt(0).toUpperCase() +
              quiz.difficulty.slice(1)}
          </p>
        </div>
        <button type="button" className={styles.outlineBtn} onClick={onNewQuiz}>
          <span aria-hidden="true">+</span>
          New Quiz
        </button>
      </div>

      {/* Per-Question Results */}
      <div className={styles.questionList}>
        {evaluation.evaluatedAnswers.map((ea, index) => {
          const userChoice = ea.selectedChoice ?? selectedAnswers[ea.questionId];
          const question = quiz.questions.find((q) => q.id === ea.questionId);
          const choices = question?.choices ?? {};

          return (
            <article
              key={ea.questionId}
              className={`${styles.questionCard} ${
                ea.isCorrect
                  ? styles.questionCardCorrect
                  : styles.questionCardIncorrect
              }`}
            >
              <div className={styles.questionHeader}>
                <span
                  className={`${styles.questionNumber} ${
                    ea.isCorrect
                      ? styles.questionNumberCorrect
                      : styles.questionNumberIncorrect
                  }`}
                >
                  {ea.isCorrect ? "✓" : "✕"}
                </span>
                <div className={styles.questionHeaderText}>
                  <span className={styles.questionIndex}>
                    Question {index + 1}
                  </span>
                  <p className={styles.questionText}>{ea.questionText}</p>
                </div>
              </div>

              <div className={styles.choices}>
                {Object.entries(choices).map(([key, text]) => {
                  const isCorrectChoice = key === ea.correctChoice;
                  const isUserChoice = key === userChoice;
                  let cls = styles.choiceResult;
                  if (isCorrectChoice) cls += ` ${styles.choiceCorrect}`;
                  if (isUserChoice && !isCorrectChoice)
                    cls += ` ${styles.choiceIncorrect}`;

                  return (
                    <div key={key} className={cls}>
                      <span
                        className={`${styles.choiceKey} ${
                          isCorrectChoice
                            ? styles.choiceKeyCorrect
                            : isUserChoice
                              ? styles.choiceKeyIncorrect
                              : ""
                        }`}
                      >
                        {key}
                      </span>
                      <span className={styles.choiceText}>{text}</span>
                      {isCorrectChoice && (
                        <span className={styles.choiceTag}>Correct</span>
                      )}
                      {isUserChoice && !isCorrectChoice && (
                        <span className={styles.choiceTagWrong}>
                          Your answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {ea.explanation && (
                <div className={styles.explanation}>
                  <strong>Explanation:</strong> {ea.explanation}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────── */

function buildClientSideEvaluation(
  quiz: QuizType,
  selectedAnswers: Record<string, string>,
): QuizEvaluation {
  let correctCount = 0;
  const evaluatedAnswers = quiz.questions.map((q) => {
    const selected = selectedAnswers[q.id];
    const isCorrect = selected === q.correctChoice;
    if (isCorrect) correctCount++;
    return {
      questionId: q.id,
      questionText: q.questionText,
      correctChoice: q.correctChoice,
      selectedChoice: selected,
      isCorrect,
      explanation: q.explanation ?? "",
    };
  });

  return {
    quizId: quiz.id,
    topic: quiz.topic,
    difficulty: quiz.difficulty,
    correctAnswerCount: correctCount,
    totalQuestions: quiz.questions.length,
    evaluatedAnswers,
  };
}
