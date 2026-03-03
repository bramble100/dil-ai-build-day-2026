import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReplayIcon from "@mui/icons-material/Replay";
import SendIcon from "@mui/icons-material/Send";
import type { ChoiceKey, CreateQuizResponse } from "../../types/quiz";

const CHOICE_KEYS: ChoiceKey[] = ["A", "B", "C", "D"];

interface QuizDisplayProps {
  quiz: CreateQuizResponse;
  onReset: () => void;
  onSubmit: (answers: Record<string, ChoiceKey>) => void;
  isSubmitting: boolean;
  submitError: Error | null;
}

export function QuizDisplay({ quiz, onReset, onSubmit, isSubmitting, submitError }: QuizDisplayProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, ChoiceKey>>({});

  const answeredCount = Object.keys(userAnswers).length;
  const totalCount = quiz.questions.length;
  const allAnswered = answeredCount === totalCount;

  const handleSelectChoice = (questionId: string, choice: ChoiceKey) => {
    if (isSubmitting) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = () => {
    if (!allAnswered || isSubmitting) return;
    onSubmit(userAnswers);
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h2" gutterBottom>
            {quiz.topic}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={quiz.difficulty} size="small" color="primary" />
            <Chip
              label={`${totalCount} question${totalCount !== 1 ? "s" : ""}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ReplayIcon />}
          onClick={onReset}
          disabled={isSubmitting}
          size="small"
        >
          New Quiz
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {answeredCount} / {totalCount}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={(answeredCount / totalCount) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {quiz.questions.map((question, idx) => {
        const selectedChoice = userAnswers[question.id];

        return (
          <Card
            key={question.id}
            sx={{ mb: 2, border: selectedChoice ? "1px solid" : undefined, borderColor: "primary.light" }}
            variant="outlined"
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1 }}>
                  {idx + 1}. {question.questionText}
                </Typography>
                {selectedChoice && <CheckCircleOutlineIcon color="primary" fontSize="small" sx={{ mt: 0.3 }} />}
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {CHOICE_KEYS.map((key) => {
                  const isSelected = selectedChoice === key;
                  return (
                    <Button
                      key={key}
                      variant={isSelected ? "contained" : "outlined"}
                      color={isSelected ? "primary" : "inherit"}
                      onClick={() => handleSelectChoice(question.id, key)}
                      disabled={isSubmitting}
                      sx={{
                        justifyContent: "flex-start",
                        textAlign: "left",
                        textTransform: "none",
                        py: 1,
                        px: 1.5,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      <Typography variant="body2" component="span" sx={{ mr: 0.75, fontWeight: 700 }}>
                        {key}.
                      </Typography>
                      {question.choices[key]}
                    </Button>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        );
      })}

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError.message}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2, mb: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!allAnswered || isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ minWidth: 200 }}
        >
          {isSubmitting ? "Evaluating..." : allAnswered ? "Submit Quiz" : `${totalCount - answeredCount} unanswered`}
        </Button>
      </Box>
    </Box>
  );
}
