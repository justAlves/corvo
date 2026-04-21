import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Entrar — ${SITE.name}`,
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Bem-vindo de volta"
      heading={
        <>
          Entra aí.
          <br />A IA tá esperando.
        </>
      }
      lede="Continua de onde parou — conversas, métricas, ajustes."
    >
      <LoginForm />
    </AuthShell>
  );
}
