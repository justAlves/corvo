"use client";

import { useState } from "react";

import { type BusinessProfileData, saveBusiness } from "@/lib/assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  if (digits.length === 11) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}

interface BusinessProfileCardProps {
  initial: BusinessProfileData;
}

export function BusinessProfileCard({ initial }: BusinessProfileCardProps) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  function set<K extends keyof BusinessProfileData>(
    key: K,
    value: BusinessProfileData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      await saveBusiness(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-card p-[22px]">
      <div className="text-sm font-semibold">Perfil do negócio</div>
      <p className="mt-0.5 mb-4 text-xs text-ink-3">
        Nome, segmento e descrição usados pela IA ao se apresentar
      </p>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nome do negócio">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex: Clínica Bela Forma"
            />
          </Field>
          <Field label="Categoria">
            <Input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="Ex: Clínica estética"
            />
          </Field>
        </div>
        <Field label="Telefone / WhatsApp">
          <Input
            value={formatPhone(form.phone)}
            onChange={(e) =>
              set("phone", e.target.value.replace(/\D/g, ""))
            }
            placeholder="(11) 99999-9999"
            inputMode="numeric"
          />
        </Field>
        <Field label="Descrição">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={3}
            className="resize-y"
            placeholder="Descreva o que o negócio faz, diferenciais, etc."
          />
        </Field>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty || busy}
          onClick={() => setForm(initial)}
        >
          Cancelar
        </Button>
        <Button size="sm" disabled={(!dirty && !saved) || busy} onClick={save}>
          {saved ? "Salvo!" : "Salvar"}
        </Button>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-ink-2">{label}</Label>
      {children}
    </div>
  );
}
