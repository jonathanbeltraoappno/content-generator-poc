"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PRESETS_KEY = "content-generator-presets";

export type Preset = { id: string; name: string; channel: string; audience: string; tone: string };

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Preset[];
        setPresets(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setPresets([]);
    }
  }, []);

  const savePreset = (preset: Omit<Preset, "id">) => {
    const newPreset: Preset = { ...preset, id: crypto.randomUUID() };
    const next = [...presets, newPreset];
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  const deletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id);
    setPresets(next);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(next));
  };

  return { presets, savePreset, deletePreset };
}

export function GenerationPresets({
  channel,
  audience,
  tone,
  onApply,
}: {
  channel: string;
  audience: string;
  tone: string;
  onApply: (p: { channel: string; audience: string; tone: string }) => void;
}) {
  const { presets, savePreset, deletePreset } = usePresets();
  const [presetName, setPresetName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!presetName.trim() || !channel || !audience || !tone) return;
    setSaving(true);
    savePreset({ name: presetName.trim(), channel, audience, tone });
    setPresetName("");
    setSaving(false);
  };

  if (presets.length === 0 && !channel && !audience && !tone) return null;

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <Label className="text-sm font-medium">Presets</Label>
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <div key={p.id} className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm">
              <button
                type="button"
                onClick={() => onApply({ channel: p.channel, audience: p.audience, tone: p.tone })}
                className="hover:underline"
              >
                {p.name}
              </button>
              <button
                type="button"
                onClick={() => deletePreset(p.id)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Delete preset ${p.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="Preset name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="max-w-[180px]"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={saving || !presetName.trim() || !channel || !audience || !tone}
        >
          Save current
        </Button>
      </div>
    </div>
  );
}
