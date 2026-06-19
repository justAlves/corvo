"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, Upload, UtensilsCrossed } from "lucide-react";

import { saveKnowledgeText, uploadKnowledgePdf } from "@/lib/assistant";
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

interface CatalogItem {
  id: number;
  name: string;
  price: string;
  description: string;
}

interface CatalogDialogProps {
  onSuccess: () => void;
  editId?: string;
  trigger?: React.ReactNode;
}

type Mode = "choose" | "manual" | "pdf";

let nextId = 1;

function parseItems(content: string): CatalogItem[] {
  return content
    .split("\n\n")
    .map((block) => {
      const lines = block.split("\n");
      const first = lines[0] ?? "";
      const match = first.match(/^•\s*(.+?)(?:\s*—\s*(.+))?$/);
      if (!match) return null;
      return {
        id: nextId++,
        name: match[1]?.trim() ?? "",
        price: match[2]?.trim() ?? "",
        description: lines[1]?.replace(/^\s+/, "") ?? "",
      };
    })
    .filter(Boolean) as CatalogItem[];
}

export function CatalogDialog({ onSuccess, editId, trigger }: CatalogDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(editId ? "manual" : "choose");
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onOpen(v: boolean) {
    setOpen(v);
    if (v && editId) {
      setBusy(true);
      try {
        const { fetchKnowledgeContent } = await import("@/lib/assistant");
        const data = await fetchKnowledgeContent(editId);
        const parsed = parseItems(data.content);
        setItems(parsed.length ? parsed : [{ id: nextId++, name: "", price: "", description: "" }]);
        setMode("manual");
      } catch {
        setItems([{ id: nextId++, name: "", price: "", description: "" }]);
      } finally {
        setBusy(false);
      }
    }
    if (!v) reset();
  }

  function reset() {
    setMode(editId ? "manual" : "choose");
    setItems([]);
    setPdfFile(null);
    setError("");
    setBusy(false);
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: nextId++, name: "", price: "", description: "" },
    ]);
  }

  function updateItem(id: number, field: keyof CatalogItem, value: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function save() {
    setError("");
    setBusy(true);
    try {
      if (mode === "pdf") {
        if (!pdfFile) { setError("Selecione um PDF antes de salvar."); setBusy(false); return; }
        await uploadKnowledgePdf(pdfFile);
      } else {
        const named = items.filter((i) => i.name.trim());
        if (named.length === 0) { setError("Adicione pelo menos um item."); setBusy(false); return; }
        const lines = named.map((item) => {
          let s = `• ${item.name.trim()}`;
          if (item.price.trim()) s += ` — ${item.price.trim()}`;
          if (item.description.trim()) s += `\n  ${item.description.trim()}`;
          return s;
        });
        if (editId) {
          const { deleteKnowledge } = await import("@/lib/assistant");
          await deleteKnowledge(editId);
        }
        await saveKnowledgeText("Cardápio / Catálogo", lines.join("\n\n"));
      }
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
            <UtensilsCrossed className="size-3.5" />
            Cardápio
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Cardápio / Catálogo</DialogTitle>
          <DialogDescription>
            Liste o que você vende — a IA vai usar isso pra responder clientes.
          </DialogDescription>
        </DialogHeader>

        {mode === "choose" && (
          <div className="grid grid-cols-2 gap-3 py-2">
            <ModeCard
              icon="✍️"
              title="Digitar manualmente"
              desc="Adicione cada produto ou serviço um por um"
              onClick={() => { setMode("manual"); addItem(); }}
            />
            <ModeCard
              icon="📄"
              title="Importar PDF"
              desc="Envie um cardápio ou catálogo em PDF"
              onClick={() => setMode("pdf")}
            />
          </div>
        )}

        {mode === "manual" && (
          <div className="flex max-h-[400px] flex-col gap-3 overflow-y-auto py-1 pr-1">
            {items.map((item, idx) => (
              <div key={item.id} className="rounded-lg border border-line bg-surface p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-2">Item {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-ink-3 hover:text-destructive"
                    aria-label="Remover item"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_140px] gap-2">
                  <Field label="Nome *">
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      placeholder="Ex: Corte feminino"
                      autoFocus={idx === items.length - 1}
                    />
                  </Field>
                  <Field label="Preço">
                    <Input
                      value={item.price}
                      onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      placeholder="Ex: R$ 80"
                    />
                  </Field>
                </div>
                <Field label="Descrição (opcional)" className="mt-2">
                  <Textarea
                    value={item.description}
                    onChange={(e) => updateItem(item.id, "description", e.target.value)}
                    placeholder="Ex: Inclui lavagem e escova"
                    rows={2}
                    className="resize-none"
                  />
                </Field>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1.5 self-start" onClick={addItem}>
              <Plus className="size-3.5" /> Novo item
            </Button>
          </div>
        )}

        {mode === "pdf" && (
          <div className="py-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                "flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-line px-6 py-10 text-center transition-colors",
                "hover:border-accent hover:bg-accent/5",
                pdfFile && "border-accent bg-accent/5",
              )}
            >
              <Upload className="size-8 text-ink-3" />
              {pdfFile ? (
                <>
                  <span className="text-sm font-medium">{pdfFile.name}</span>
                  <span className="text-xs text-ink-3">
                    {(pdfFile.size / 1024).toFixed(0)} KB · clique pra trocar
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium">Clique para selecionar o PDF</span>
                  <span className="text-xs text-ink-3">Tamanho máximo: 8 MB</span>
                </>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          {mode !== "choose" && (
            <Button variant="ghost" size="sm" onClick={() => setMode("choose")} disabled={busy}>
              Voltar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
            Cancelar
          </Button>
          {mode !== "choose" && (
            <Button size="sm" onClick={save} disabled={busy}>
              {busy ? "Salvando…" : "Salvar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface px-4 py-6 text-center transition-colors hover:border-accent hover:bg-accent/5"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-ink-3">{desc}</span>
    </button>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-xs text-ink-2">{label}</Label>
      {children}
    </div>
  );
}
