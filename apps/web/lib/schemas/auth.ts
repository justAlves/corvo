import { z } from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Informe um e-mail válido" }),
  password: z.string().min(1, { message: "Informe sua senha" }),
  remember: z.boolean(),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, { message: "Nos diga como te chamar" }),
    email: z.email({ message: "Informe um e-mail válido" }),
    password: z
      .string()
      .min(6, { message: "A senha precisa de pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(1, { message: "Confirme sua senha" }),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "Você precisa aceitar os termos para continuar",
    }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type SignupValues = z.infer<typeof signupSchema>;
