import z from "zod";

const envSchema = z.object({
    DATABASE_URL: z.string().nonempty(),
    EVOLUTION_API_URL: z.string().url(),
    EVOLUTION_API_KEY: z.string().nonempty(),
    PUBLIC_WEBHOOK_URL: z.string().url(),
    AI_PROVIDER: z.enum(["gemini"]).default("gemini"),
    AI_MODEL: z.string().default("gemini-2.5-flash"),
    GEMINI_API_KEY: z.string().optional(),
    AUTO_CLOSE_HOURS: z.coerce.number().int().positive().default(24),
    TRIAL_DAYS: z.coerce.number().int().positive().default(14),
    ABACATEPAY_PRODUCT_ID: z.string().default(""),
    ABACATEPAY_WEBHOOK_SECRET: z.string().default(""),
    ABACATEPAY_API_KEY: z.string().default(""),
})

export const env = envSchema.parse(process.env)
