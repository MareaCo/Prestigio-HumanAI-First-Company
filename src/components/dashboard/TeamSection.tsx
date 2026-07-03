import { DIMENSIONS, DIM_MAX, PERFIL_CONFIG, TIER_NAMES } from "@/data/constants";
import type { Diagnostic } from "@/types";

interface Props {
  teamDiagnostics: Diagnostic[];
  allDiagnostics: Diagnostic[];
  areaName: string;
  isCompanyWide?: boolean;
}


const QUADRANTS = [
  { key: "q2", label: "Q2 · Asistentes", bg: "#FEF6E6", fg: "#854F0B" },
  { key: "q4", label: "Q4 · Agentes", bg: "#E6F2FB", fg: "#0C447C" },
  { key: "q1", label: "Q1 · Ridiculist", bg: "#FDECEA", fg: "#993C1D" },
  { key: "q3", label: "Q3 · Automatización", bg: "#E6F5F0", fg: "#085041" },
] as const;

function avgDim(diags: Diagnostic[], dim: (typeof DIMENSIONS)[number]) {
  if (diags.length === 0) return 0;
  return diags.reduce((s, d) => s + (d.dim_scores?.[dim] ?? 0), 0) / diags.length;
}

export function TeamSection({ teamDiagnostics, allDiagnostics, areaName, isCompanyWide }: Props) {
  const teamAvg = Object.fromEntries(DIMENSIONS.map((d) => [d, avgDim(teamDiagnostics, d)]));
  const companyAvg = Object.fromEntries(DIMENSIONS.map((d) => [d, avgDim(allDiagnostics, d)]));

  const activitySums = QUADRANTS.map((q) => ({
    ...q,
    total: teamDiagnostics.reduce(
      (s, d) => s + (d.activities_q?.[q.key as "q1" | "q2" | "q3" | "q4"] ?? 0),
      0,
    ),
  }));

  const champions = teamDiagnostics
    .filter((d) => d.perfil === "Facilitador" || d.perfil === "Amplificador")
    .sort((a, b) => b.tier - a.tier);

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="rounded-2xl p-6 text-white" style={{ background: "#1A1A1A" }}>
        <p
          className="uppercase"
          style={{ fontSize: 10, opacity: 0.5, letterSpacing: "0.1em" }}
        >
          {isCompanyWide ? "Vista general" : "Vista de equipo"}
        </p>
        <h3 className="font-display text-xl font-bold mt-1">{areaName}</h3>
        <p className="text-[12px] mt-1" style={{ opacity: 0.7 }}>
          {isCompanyWide
            ? "Resumen consolidado para Admin / RRHH."
            : "Detalle adicional para el Líder de esta área."}
        </p>
      </div>


      <div className="grid grid-cols-2 gap-4">
        {/* Dimensiones */}
        <div className="bg-white rounded-2xl p-6 border border-ink/5">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted">
            Dimensiones equipo vs. compañía
          </p>
          <div className="mt-4 space-y-3">
            {DIMENSIONS.map((dim) => {
              const t = teamAvg[dim] ?? 0;
              const c = companyAvg[dim] ?? 0;
              const max = DIM_MAX[dim];
              return (
                <div key={dim} className="flex items-center gap-3">
                  <span className="text-[12px] text-ink-soft" style={{ width: 90 }}>
                    {dim}
                  </span>
                  <div className="relative flex-1 h-2 rounded-full bg-ink/10 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${(c / max) * 100}%`, background: "#B5B5AE" }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${(t / max) * 100}%`, background: "#1A1A1A" }}
                    />
                  </div>
                  <span className="text-[12px] text-ink font-medium w-12 text-right">
                    {t.toFixed(1)}/{max}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-4 text-[11px] text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-ink" /> este equipo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: "#B5B5AE" }} /> promedio
              compañía
            </span>
          </div>
        </div>

        {/* Actividades */}
        <div className="bg-white rounded-2xl p-6 border border-ink/5">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted">
            Actividades del equipo
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {activitySums.map((q) => (
              <div
                key={q.key}
                className="rounded-xl p-4"
                style={{ background: q.bg, color: q.fg }}
              >
                <p className="text-[10px] uppercase tracking-wider" style={{ opacity: 0.8 }}>
                  {q.label}
                </p>
                <p className="font-display font-bold mt-1" style={{ fontSize: "1.6rem" }}>
                  {q.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Champions */}
      <div className="bg-white rounded-2xl p-6 border border-ink/5">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] uppercase tracking-widest text-ink-muted">
            Champions del equipo
          </p>
          {champions.length > 0 && (
            <p className="text-[11px] text-ink-muted">
              {champions.length} {champions.length === 1 ? "persona" : "personas"}
            </p>
          )}
        </div>
        {champions.length === 0 ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            Ningún empleado de esta área está aún en perfil Facilitador o Amplificador.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {champions.map((d) => {
              const cfg = PERFIL_CONFIG[d.perfil];
              const initials =
                d.employee?.name
                  ?.split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() ?? "??";
              return (
                <li
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl border border-ink/5 bg-paper/40 px-3 py-2.5 hover:border-ink/15 transition-colors"
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                    style={{ background: cfg.light, color: cfg.dark }}
                  >
                    {initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-ink truncate">{d.employee?.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ background: cfg.dark }}
                      />
                      <p className="text-[10.5px] text-ink-muted truncate">
                        {d.perfil} · {TIER_NAMES[d.tier - 1]}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

