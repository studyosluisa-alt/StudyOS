import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "O nome da matéria é obrigatório"),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional().default("#3b82f6"),
});
