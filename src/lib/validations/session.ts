import { z } from "zod";

export const sessionSchema = z.object({
  subjectId: z.string().min(1, "O ID da matéria é obrigatório"),
  startTime: z.string().datetime({ message: "Data de início inválida" }),
  endTime: z.string().datetime({ message: "Data de fim inválida" }),
  duration: z.number().nonnegative("Duração deve ser um número positivo"),
  manual: z.boolean().optional(),
  type: z.string().optional(),
  notes: z.string().optional(),
  scheduleReview: z.union([z.string(), z.number()]).optional(),
});
