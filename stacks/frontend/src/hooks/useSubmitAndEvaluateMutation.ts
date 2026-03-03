import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { ChoiceKey, QuizEvaluation } from "../types/quiz";

interface SubmitAndEvaluateArgs {
  quizId: string;
  answers: Record<string, ChoiceKey>;
}

export function useSubmitAndEvaluateMutation() {
  return useMutation<QuizEvaluation, Error, SubmitAndEvaluateArgs>({
    mutationFn: async ({ quizId, answers }) => {
      await api.submitAnswers({ quizId, answers });
      return api.evaluate(quizId);
    },
  });
}
