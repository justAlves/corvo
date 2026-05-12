import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    EVOLUTION_API_URL: z.string().url(),
    EVOLUTION_API_KEY: z.string().nonempty(),
    PUBLIC_WEBHOOK_URL: z.string().url(),
    AI_PROVIDER: z.enum(["gemini"]).default("gemini"),
    AI_MODEL: z.string().default("gemini-2.5-flash"),
    GEMINI_API_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)
