import { AWARE_STAGES } from "@/data/constants";
import type { AwareScores } from "@/hooks/useDashboard";

function colorFor(score: number) {
  if (score >= 70) return { bg: "#E6F5F0", fg: "#3A8E6E", bar: "#3A8E6E" };
  if (score >= 40) return { bg: "#FEF6E6", fg: "#854F0B", bar: "#854F0B" };
  return { bg: "#FDECEA", fg: "#993C1D", bar: "#993C1D" };
}

export function AwareGrid({ scores }: { scores: AwareScores | null }) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {AWARE_STAGES.map((s) => {
        const score = scores?.[s.key] ?? null;
        const c = score === null ? { bg: "#F0F0EC", fg: "#888880", bar: "#B5B5AE" } : colorFor(score);
        return (
          <div
            key={s.key}
            className="rounded-[14px] p-4 text-center"
            style={{ background: c.bg, color: c.fg }}
          >
            <p className="font-display font-bold" style={{ fontSize: "1.6rem", lineHeight: 1 }}>
              {s.letter}
            </p>
            <p
              className="mt-2 text-ink-muted uppercase tracking-wider"
              style={{ fontSize: 10, fontWeight: 500 }}
            >
              {s.name}
            </p>
            <p style={{ fontSize: "1.4rem", fontWeight: 500, marginTop: 4 }}>
              {score === null ? "—" : score}
            </p>
            <div
              className="mt-2 h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(0,0,0,0.08)" }}
            >
              <div
                className="h-full"
                style={{ width: `${score ?? 0}%`, background: c.bar }}
              />
            </div>
            <p
              className="mt-3 text-ink-muted"
              style={{ fontSize: 9.5, lineHeight: 1.3 }}
            >
              {s.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
