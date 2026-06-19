"use client";

import { useState } from "react";

import { type BusinessProfileData, saveBusiness } from "@/lib/assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const WEEKEND_OPTIONS: { value: BusinessProfileData["weekend"]; label: string }[] = [
  { value: "nao", label: "Não atende" },
  { value: "sabado", label: "Só sábado" },
  { value: "sim", label: "Sáb e dom" },
];

interface HoursAddressCardProps {
  initial: BusinessProfileData;
}

export function HoursAddressCard({ initial }: HoursAddressCardProps) {
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
      <div className="text-sm font-semibold">Horário e endereço</div>
      <p className="mt-0.5 mb-4 text-xs text-ink-3">
        Informado ao cliente quando perguntado onde ou quando você atende
      </p>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Abre">
            <Input
              type="time"
              value={form.hoursFrom}
              onChange={(e) => set("hoursFrom", e.target.value)}
            />
          </Field>
          <Field label="Fecha">
            <Input
              type="time"
              value={form.hoursTo}
              onChange={(e) => set("hoursTo", e.target.value)}
            />
          </Field>
          <Field label="Fim de semana">
            <select
              className="h-11 w-full rounded-md border border-line-strong bg-background px-3 text-sm tracking-[-0.005em] text-ink outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft"
              value={form.weekend || "nao"}
              onChange={(e) =>
                set("weekend", e.target.value as BusinessProfileData["weekend"])
              }
            >
              {WEEKEND_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Endereço">
          <Input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Ex: Rua das Flores, 42 - São Paulo"
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
