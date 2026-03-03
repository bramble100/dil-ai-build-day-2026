import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReplayIcon from "@mui/icons-material/Replay";
import CancelIcon from "@mui/icons-material/Cancel";
import type { QuizEvaluation as QuizEvaluationType } from "../../types/quiz";

interface QuizEvaluationProps {
  evaluation: QuizEvaluationType;
  topic: string;
  onReset: () => void;
}

export function QuizEvaluation({ evaluation, topic, onReset }: QuizEvaluationProps) {
  const [showDetails, setShowDetails] = useState(false);

  const scoreColor =
    evaluation.percentage >= 80
      ? "success"
      : evaluation.percentage >= 50
        ? "warning"
        : "error";

  return (
    <Box sx={{ maxWidth: 720, mx: "auto" }}>
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
          color: "white",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" gutterBottom>
            Quiz Complete!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.85, mb: 3 }}>
            {topic}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 3 }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {evaluation.percentage}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Score
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.3)" }} />
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {evaluation.score}/{evaluation.totalQuestions}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Correct
              </Typography>
            </Box>
          </Box>
          <Chip
            label={
              evaluation.percentage >= 80
                ? "Excellent!"
                : evaluation.percentage >= 50
                  ? "Good effort!"
                  : "Keep practicing!"
            }
            color={scoreColor}
            sx={{ fontWeight: 600 }}
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }} variant="outlined">
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <AutoAwesomeIcon color="primary" fontSize="small" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              AI Evaluation
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {evaluation.evaluation}
          </Typography>
        </CardContent>
      </Card>

      <Accordion
        expanded={showDetails}
        onChange={(_, expanded) => setShowDetails(expanded)}
        variant="outlined"
        sx={{ mb: 3 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Detailed Results ({evaluation.score} correct, {evaluation.totalQuestions - evaluation.score} incorrect)
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          {evaluation.results.map((result, idx) => (
            <Box
              key={result.questionId}
              sx={{
                p: 2,
                borderTop: idx > 0 ? "1px solid" : undefined,
                borderColor: "divider",
                bgcolor: result.isCorrect ? "success.50" : "error.50",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                {result.isCorrect ? (
                  <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.2, flexShrink: 0 }} />
                ) : (
                  <CancelIcon color="error" fontSize="small" sx={{ mt: 0.2, flexShrink: 0 }} />
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {idx + 1}. {result.questionText}
                  </Typography>
                  {!result.isCorrect && (
                    <>
                      <Typography variant="body2" color="error.main">
                        Your answer: {result.userAnswerText ?? "(no answer)"}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Correct answer: {result.correctAnswerText}
                      </Typography>
                    </>
                  )}
                  {result.isCorrect && (
                    <Typography variant="body2" color="success.main">
                      {result.correctAnswerText}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={onReset} size="large">
          Try Another Quiz
        </Button>
      </Box>
    </Box>
  );
}
