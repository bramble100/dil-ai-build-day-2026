import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { CreateQuizResponse, UploadQuizRequest } from "../types/quiz";

export function useUploadQuizMutation() {
  return useMutation<CreateQuizResponse, Error, UploadQuizRequest>({
    mutationFn: (body) => api.uploadQuiz(body),
  });
}
