"use client";

import { useState } from "react";
import { HelpCircle, Plus, Trash2 } from "lucide-react";

import { saveKnowledgeText } from "@/lib/assistant";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FaqEntry {
  id: number;
  question: string;
  answer: string;
}

interface FaqDialogProps {
  onSuccess: () => void;
  editId?: string;
  trigger?: React.ReactNode;
}

let nextId = 1;

function parseEntries(content: string): FaqEntry[] {
  return content
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n");
      const q = lines[0]?.replace(/^P\d+:\s*/, "").trim();
      const a = lines[1]?.replace(/^R:\s*/, "").trim();
      if (!q || !a) return null;
      return { id: nextId++, question: q, answer: a };
    })
    .filter(Boolean) as FaqEntry[];
}

export function FaqDialog({ onSuccess, editId, trigger }: FaqDialogProps) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<FaqEntry[]>([{ id: nextId++, question: "", answer: "" }]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onOpen(v: boolean) {
    setOpen(v);
    if (v && editId) {
      setBusy(true);
      try {
        const { fetchKnowledgeContent } = await import("@/lib/assistant");
        const data = await fetchKnowledgeContent(editId);
        const parsed = parseEntries(data.content);
        setEntries(parsed.length ? parsed : [{ id: nextId++, question: "", answer: "" }]);
      } catch {
        setEntries([{ id: nextId++, question: "", answer: "" }]);
      } finally {
        setBusy(false);
      }
    }
    if (!v) reset();
  }

  function reset() {
    setEntries([{ id: nextId++, question: "", answer: "" }]);
    setError("");
    setBusy(false);
  }

  function addEntry() {
    setEntries((prev) => [...prev, { id: nextId++, question: "", answer: "" }]);
  }

  function update(id: number, field: keyof FaqEntry, value: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }

  function remove(id: number) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  async function save() {
    setError("");
    const valid = entries.filter((e) => e.question.trim() && e.answer.trim());
    if (valid.length === 0) {
      setError("Preencha pelo menos uma pergunta e resposta.");
      return;
    }
    setBusy(true);
    try {
      const content = valid
        .map((e, i) => `P${i + 1}: ${e.question.trim()}\nR: ${e.answer.trim()}`)
        .join("\n\n");
      if (editId) {
        const { deleteKnowledge } = await import("@/lib/assistant");
        await deleteKnowledge(editId);
      }
      await saveKnowledgeText("FAQ — Perguntas frequentes", content);
      setOpen(false);
      reset();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1.5">
            <HelpCircle className="size-3.5" />
            FAQ
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>FAQ — Perguntas frequentes</DialogTitle>
          <DialogDescription>
            Adicione perguntas e respostas que a IA vai usar pra responder seus clientes na hora.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto py-1 pr-1">
          {entries.map((entry, idx) => (
            <div
              key={entry.id}
              className="rounded-lg border border-line bg-surface p-3.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-2">
                  Pergunta {idx + 1}
                </span>
                {entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    className="text-ink-3 hover:text-destructive"
                    aria-label="Remover"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
              <div className={cn("flex flex-col gap-2")}>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-ink-2">Pergunta *</Label>
                  <Input
                    value={entry.question}
                    onChange={(e) => update(entry.id, "question", e.target.value)}
                    placeholder="Ex: Qual o horário de atendimento?"
                    autoFocus={idx === entries.length - 1}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-ink-2">Resposta *</Label>
                  <Textarea
                    value={entry.answer}
                    onChange={(e) => update(entry.id, "answer", e.target.value)}
                    placeholder="Ex: Atendemos de segunda a sexta, das 9h às 18h."
                    rows={2}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 self-start"
            onClick={addEntry}
          >
            <Plus className="size-3.5" /> Nova pergunta
          </Button>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button size="sm" onClick={save} disabled={busy}>
            {busy ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
