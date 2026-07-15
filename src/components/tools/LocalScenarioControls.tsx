"use client";

import { useEffect, useState } from "react";
import {
  TOOL_SCENARIO_PREFIX,
  parseToolScenario,
  serializeToolScenario,
} from "@/lib/tool-scenarios";

export function LocalScenarioControls<T>({
  toolId,
  scenario,
  validate,
  onRestore,
}: {
  toolId: string;
  scenario: T;
  validate: (value: unknown) => value is T;
  onRestore: (scenario: T) => void;
}) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const key = `${TOOL_SCENARIO_PREFIX}${toolId}`;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = parseToolScenario(window.localStorage.getItem(key), validate);
      setSavedAt(saved?.savedAt ?? null);
      if (!saved) window.localStorage.removeItem(key);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [key, validate]);

  const save = () => {
    const now = new Date();
    window.localStorage.setItem(key, serializeToolScenario(scenario, now));
    setSavedAt(now.toISOString());
  };

  const restore = () => {
    const saved = parseToolScenario(window.localStorage.getItem(key), validate);
    if (!saved) {
      window.localStorage.removeItem(key);
      setSavedAt(null);
      return;
    }
    onRestore(saved.scenario);
  };

  const clear = () => {
    window.localStorage.removeItem(key);
    setSavedAt(null);
  };

  return (
    <div className="grid gap-2 rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
      <p><strong className="text-foreground">Private scenario</strong> — saved only in this browser, never in the URL or sent to Know Plain.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={save} className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-accent">
          {savedAt ? "Replace saved scenario" : "Save on this device"}
        </button>
        {savedAt && (
          <>
            <button type="button" onClick={restore} className="min-h-11 rounded-lg border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-accent">Restore saved</button>
            <button type="button" onClick={clear} className="min-h-11 px-2 py-2 font-medium text-foreground underline underline-offset-2">Delete saved</button>
          </>
        )}
      </div>
      {savedAt && <p aria-live="polite">Saved on this device {new Date(savedAt).toLocaleString()}.</p>}
    </div>
  );
}
