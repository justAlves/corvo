import cors from "@elysiajs/cors";
import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { AuthModule, OpenAPI } from "./modules/auth";
import { OnboardingModule } from "./modules/onboarding";
import { WhatsappModule } from "./modules/whatsapp";

const app = new Elysia()
  .use(
    cors({
      origin: ['https://krewo.app', 'http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  )
  .use(
    openapi({
        documentation: {
            components: await OpenAPI.components,
            paths: await OpenAPI.getPaths()
        }
    })
  )
  .use(AuthModule)
  .use(WhatsappModule)
  .use(OnboardingModule)
  .get("/", () => "Hello Elysia")
  .listen({ port: 3333, hostname: '0.0.0.0' });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
