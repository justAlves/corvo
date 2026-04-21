import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { SITE } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Criar conta — ${SITE.name}`,
};

export default function CadastroPage() {
  return (
    <AuthShell
      eyebrow="Começa grátis · 7 dias"
      heading={
        <>
          Sua assistente,
          <br />
          <em
            className="font-serif italic"
            style={{
              color: "var(--foreground)",
              background: "var(--accent-soft)",
              padding: "0 0.08em",
              borderRadius: 8,
            }}
          >
            atendendo em minutos.
          </em>
        </>
      }
      lede="Sem cartão. Conecta o WhatsApp, conta do teu negócio, e pronto."
    >
      <SignupForm />
    </AuthShell>
  );
}
