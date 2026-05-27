import { z } from "zod";

export const questionSchema = z.object({
  content: z.string().min(1, "O conteúdo da questão é obrigatório"),
  optionA: z.string().min(1, "Opção A é obrigatória"),
  optionB: z.string().min(1, "Opção B é obrigatória"),
  optionC: z.string().min(1, "Opção C é obrigatória"),
  optionD: z.string().optional(),
  optionE: z.string().optional(),
  correctOption: z.string().min(1, "Opção correta é obrigatória"),
  explanation: z.string().optional(),
  examName: z.string().optional(),
});
