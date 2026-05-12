"use client";

import { Loader2, Paperclip, Zap } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Field } from "@/components/onboarding/field";
import { KnowledgeList } from "@/components/onboarding/knowledge-list";
import { StepTitle } from "@/components/onboarding/step-title";
import type { BusinessInfo } from "@/components/onboarding/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import {
  deleteKnowledge,
  importKnowledgeUrl,
  uploadKnowledgeFile,
  type KnowledgeItem,
} from "@/lib/knowledge";
import {
  BUSINESS_CATEGORIES,
  WEEKEND_OPTIONS,
  type WeekendOption,
} from "@/lib/onboarding-config";
import { cn } from "@/lib/utils";

interface StepBusinessProps {
  biz: BusinessInfo;
  update: (patch: Partial<BusinessInfo>) => void;
  knowledge: KnowledgeItem[];
  onKnowledgeAdd: (item: KnowledgeItem) => void;
  onKnowledgeRemove: (id: string) => void;
}

const ACCEPTED_FILES = ".pdf,.txt,.md,.csv,application/pdf,text/plain,text/markdown,text/csv";

export function StepBusiness({
  biz,
  update,
  knowledge,
  onKnowledgeAdd,
  onKnowledgeRemove,
}: StepBusinessProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlBusy, setUrlBusy] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleImportUrl = async () => {
    const raw = window.prompt(
      "Cola a URL do site do negócio (ex: https://seurestaurante.com.br)",
    );
    if (!raw) return;
    const url = raw.trim();
    if (!url) return;
    setUrlBusy(true);
    try {
      const item = await importKnowledgeUrl(url);
      onKnowledgeAdd(item);
      toast.success("Site importado", {
        description: `${item.title} virou base de conhecimento.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Não consegui importar esse site.";
      toast.error("Não rolou importar", { description: message });
    } finally {
      setUrlBusy(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploadBusy(true);
    try {
      const item = await uploadKnowledgeFile(file);
      onKnowledgeAdd(item);
      toast.success("Arquivo adicionado", {
        description: `${item.title} foi processado.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Falhou ao processar o arquivo.";
      toast.error("Erro no upload", { description: message });
    } finally {
      setUploadBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      await deleteKnowledge(id);
      onKnowledgeRemove(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não consegui remover.";
      toast.error("Erro", { description: message });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <StepTitle
        k="02"
        title="Conta do teu negócio"
        sub="Quanto mais a IA souber, melhor ela responde. Dá pra importar do site se preferir."
      />

      <div className="mt-5 flex flex-wrap gap-2 animate-fade-up">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleImportUrl}
          disabled={urlBusy}
          type="button"
        >
          {urlBusy ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Zap className="size-3" />
          )}
          Importar do site
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadBusy}
          type="button"
        >
          {uploadBusy ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Paperclip className="size-3" />
          )}
          Upload PDF / cardápio
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      <KnowledgeList
        items={knowledge}
        onRemove={handleRemove}
        removing={removingId}
      />

      <div
        className="mt-5 grid animate-fade-up grid-cols-1 gap-3.5 md:grid-cols-2"
        style={{ animationDelay: "60ms" }}
      >
        <Field label="Nome do negócio">
          <Input
            placeholder="Ex: Cantina do Sílvio"
            value={biz.name}
            onChange={(e) => update({ name: e.target.value })}
            autoFocus
          />
        </Field>

        <Field label="Categoria">
          <select
            value={biz.category}
            onChange={(e) => update({ category: e.target.value })}
            className={cn(
              "flex h-11 w-full rounded-md border border-line-strong bg-background px-3 py-2 text-sm tracking-[-0.005em] outline-none transition-[border-color,box-shadow] duration-150",
              "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft",
            )}
          >
            <option value="">Selecionar…</option>
            {BUSINESS_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Telefone de contato">
          <Input
            placeholder="(11) 9xxxx-xxxx"
            value={biz.phone}
            onChange={(e) => update({ phone: e.target.value })}
          />
        </Field>

        <Field label="Endereço">
          <Input
            placeholder="Rua, número, bairro"
            value={biz.address}
            onChange={(e) => update({ address: e.target.value })}
          />
        </Field>

        <Field
          label="Horário de funcionamento"
          hint="Seg a Sex · fora disso ela avisa que tá fechado"
        >
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={biz.hoursFrom}
              onChange={(e) => update({ hoursFrom: e.target.value })}
            />
            <Input
              type="time"
              value={biz.hoursTo}
              onChange={(e) => update({ hoursTo: e.target.value })}
            />
          </div>
        </Field>

        <Field label="Atende nos finais de semana?">
          <div className="flex gap-1.5">
            {WEEKEND_OPTIONS.map((o) => (
              <WeekendPill
                key={o}
                value={o}
                active={biz.weekend === o}
                onClick={() => update({ weekend: o })}
              />
            ))}
          </div>
        </Field>

        <Field
          className="md:col-span-2"
          label="O que você faz, em poucas palavras"
          hint='A IA usa isso pra responder "o que vocês fazem?" e qualificar interessados.'
        >
          <textarea
            value={biz.description}
            onChange={(e) => update({ description: e.target.value })}
            placeholder="Ex: Cantina italiana no Tatuapé, pratos artesanais, delivery no bairro e eventos pra até 80 pessoas…"
            rows={3}
            className={cn(
              "flex min-h-[96px] w-full rounded-md border border-line-strong bg-background px-3 py-2.5 text-sm font-sans leading-[1.55] tracking-[-0.005em] outline-none transition-[border-color,box-shadow] duration-150",
              "placeholder:text-ink-3",
              "focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent-soft",
            )}
          />
        </Field>
      </div>
    </div>
  );
}

function WeekendPill({
  value,
  active,
  onClick,
}: {
  value: WeekendOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center justify-center rounded-md border px-3 py-2 text-[13px] font-medium transition-[border-color,background-color,color,transform] duration-150",
        active
          ? "border-accent-line bg-accent-soft text-accent-foreground dark:text-foreground"
          : "border-line-strong bg-background text-foreground hover:border-foreground",
        "active:scale-[0.98]",
      )}
    >
      {value}
    </button>
  );
}
