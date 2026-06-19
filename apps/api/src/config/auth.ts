import { betterAuth } from "better-auth";
import { admin, openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "./db"; // your drizzle instance
import { schema } from "../shared/tables/schema";

export const auth = betterAuth({
	baseURL: process.env.BETTER_AUTH_URL,
	database: drizzleAdapter(drizzle, {
		provider: "pg",
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	plugins: [admin(), openAPI()],
	trustedOrigins: [
		"http://localhost:3000",
		"https://krewo.app",
	],
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: ".krewo.app",
		},
	},
});
