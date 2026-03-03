import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { QuizForm, type QuizFormData } from "../components/quiz/QuizForm";
import { QuizDisplay } from "../components/quiz/QuizDisplay";
import { QuizEvaluation } from "../components/quiz/QuizEvaluation";
import { Chatbot } from "../components/chatbot/Chatbot";
import { useCreateQuizMutation } from "../hooks/useCreateQuizMutation";
import { useCreateMcpQuizMutation } from "../hooks/useCreateMcpQuizMutation";
import { useUploadQuizMutation } from "../hooks/useUploadQuizMutation";
import { useSubmitAndEvaluateMutation } from "../hooks/useSubmitAndEvaluateMutation";
import type { ChoiceKey, CreateQuizResponse, QuizEvaluation as QuizEvaluationType } from "../types/quiz";

type Stage = "form" | "quiz" | "evaluated";

export function Quiz() {
  const [stage, setStage] = useState<Stage>("form");
  const [quiz, setQuiz] = useState<CreateQuizResponse | null>(null);
  const [evaluation, setEvaluation] = useState<QuizEvaluationType | null>(null);

  const aiMutation = useCreateQuizMutation();
  const mcpMutation = useCreateMcpQuizMutation();
  const uploadMutation = useUploadQuizMutation();
  const submitEvaluateMutation = useSubmitAndEvaluateMutation();

  const isGenerating = aiMutation.isPending || mcpMutation.isPending || uploadMutation.isPending;
  const generateError = aiMutation.error ?? mcpMutation.error ?? uploadMutation.error;

  const handleGenerate = (data: QuizFormData) => {
    const onSuccess = (result: CreateQuizResponse) => {
      setQuiz(result);
      setStage("quiz");
    };

    if (data.mode === "ai") {
      aiMutation.mutate(data.request, { onSuccess });
    } else if (data.mode === "mcp") {
      mcpMutation.mutate(data.request, { onSuccess });
    } else if (data.mode === "upload") {
      uploadMutation.mutate(data.request, { onSuccess });
    }
  };

  const handleSubmitAnswers = (answers: Record<string, ChoiceKey>) => {
    if (!quiz) return;
    submitEvaluateMutation.mutate(
      { quizId: quiz.quizId, answers },
      {
        onSuccess: (result) => {
          setEvaluation(result);
          setStage("evaluated");
        },
      },
    );
  };

  const handleReset = () => {
    setStage("form");
    setQuiz(null);
    setEvaluation(null);
    aiMutation.reset();
    mcpMutation.reset();
    uploadMutation.reset();
    submitEvaluateMutation.reset();
  };

  return (
    <Box sx={{ py: 4, px: 2 }}>
      {stage === "form" && (
        <>
          <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
            Create a Quiz
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
            Choose a generation mode and let AI craft your quiz.
          </Typography>
          <QuizForm
            onSubmit={handleGenerate}
            isLoading={isGenerating}
            error={generateError}
          />
        </>
      )}

      {stage === "quiz" && quiz && (
        <QuizDisplay
          quiz={quiz}
          onReset={handleReset}
          onSubmit={handleSubmitAnswers}
          isSubmitting={submitEvaluateMutation.isPending}
          submitError={submitEvaluateMutation.error}
        />
      )}

      {stage === "evaluated" && evaluation && quiz && (
        <>
          <QuizEvaluation
            evaluation={evaluation}
            topic={quiz.topic}
            onReset={handleReset}
          />
          <Chatbot topic={quiz?.topic ?? ""} />
        </>
    )}
    </Box>
  );
}
