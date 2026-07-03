import { useEffect, useMemo, useState } from "react";
import { Radar } from "react-chartjs-2";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { registerCharts } from "@/lib/charts";
import { DIMENSIONS, DIM_MAX, MAX_SCORE } from "@/data/constants";
import { getLowestDim, tierById } from "@/data/scoring";
import type { Dimension } from "@/data/questions";
import type { Diagnostic } from "@/types";
import { MatrizInteractiva } from "@/components/report/MatrizInteractiva";

registerCharts();

// Percentiles del radar (0-100%) por dimensión (7): Mentalidad, Contexto, Datos, Automatización, Calidad, Autonomía, Liderazgo
const AVG_LINE = [50, 42, 47, 33, 38, 30, 40];
const TOP_LINE = [90, 92, 97, 92, 92, 87, 88];

export function ReportScreen() {
  const { latestDiagnosticId, navigateTo } = useApp();
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latestDiagnosticId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("diagnostics")
        .select("*, employee:employees(*)")
        .eq("id", latestDiagnosticId)
        .maybeSingle();
      if (!cancelled) {
        setDiagnostic((data as unknown as Diagnostic) ?? null);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [latestDiagnosticId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream text-ink p-10">
        <p className="text-ink-muted text-sm">Cargando reporte…</p>
      </main>
    );
  }
  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-cream text-ink p-10">
        <button
          onClick={() => navigateTo("dashboard")}
          className="text-[12px] text-ink-muted hover:text-ink"
        >
          ← Volver al tablero
        </button>
        <p className="mt-6 text-ink">No se encontró el diagnóstico.</p>
      </main>
    );
  }

  return <ReportContent diagnostic={diagnostic} />;
}

function ReportContent({ diagnostic }: { diagnostic: Diagnostic }) {
  const { navigateTo } = useApp();
  const tier = tierById(diagnostic.tier);
  const dimScores = diagnostic.dim_scores;
  const lowestDim = useMemo(
    () =>
      getLowestDim(dimScores as unknown as Record<Dimension, number>),
    [dimScores],
  );

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-[820px] px-6 py-8">
        <button
          onClick={() => navigateTo("dashboard")}
          className="text-[12px] text-ink-muted hover:text-ink mb-4"
        >
          ← Volver al tablero
        </button>

        <Reveal delay={0}><HeroCard diagnostic={diagnostic} tier={tier} /></Reveal>
        <Reveal delay={80}><CapaBanner tier={tier} /></Reveal>
        <Reveal delay={160}><DimensionsCard dimScores={dimScores} tierColor={tier.color} /></Reveal>
        <Reveal delay={240}><RadarCard dimScores={dimScores} tierColor={tier.color} /></Reveal>
        <Reveal delay={320}><StrengthsCard dimScores={dimScores} /></Reveal>
        <Reveal delay={400}><PlanCard tier={tier} lowestDim={lowestDim} dimScores={dimScores} /></Reveal>
        <Reveal delay={480}><PositionCard tier={tier} /></Reveal>
        <Reveal delay={560}>
          <MatrizInteractiva tierId={tier.id} diagnosticId={diagnostic.id} />
        </Reveal>
        <Reveal delay={640}><CTABottom tier={tier} onBack={() => navigateTo("dashboard")} /></Reveal>
      </div>
    </main>
  );
}

function Reveal({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// -------- Section wrapper --------
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <section
      className="bg-white mb-5 border border-ink/5"
      style={{ borderRadius: 16, padding: "1.75rem" }}
    >
      {children}
    </section>
  );
}

// -------- Hero --------
function HeroCard({
  diagnostic,
  tier,
}: {
  diagnostic: Diagnostic;
  tier: ReturnType<typeof tierById>;
}) {
  const pct = Math.round((diagnostic.total_score / MAX_SCORE) * 100);
  return (
    <SectionCard>
      <span
        className="inline-block rounded-full uppercase font-medium tracking-widest"
        style={{
          background: tier.colorLight,
          color: tier.color,
          padding: "6px 12px",
          fontSize: 11,
        }}
      >
        Tu nivel IA · Tier {tier.id} de 6
      </span>
      <h1
        className="font-display mt-3"
        style={{
          fontSize: "clamp(2.6rem, 7vw, 4.6rem)",
          fontWeight: 900,
          color: tier.color,
          lineHeight: 1,
        }}
      >
        {tier.name}
      </h1>

      <p className="mt-5 text-[11px] uppercase tracking-widest text-ink-muted">
        {tier.scoreLabel}
      </p>
      <div className="flex items-baseline gap-2">
        <span
          className="font-display font-bold text-ink"
          style={{ fontSize: "3.6rem", lineHeight: 1 }}
        >
          {diagnostic.total_score}
        </span>
        <span className="text-ink-muted" style={{ fontSize: "1.4rem" }}>
          /{MAX_SCORE}
        </span>
      </div>
      <div className="mt-3 h-[6px] rounded-full bg-ink/5 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: tier.color }}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 border border-ink/10 rounded-[12px] divide-x divide-ink/10 overflow-hidden">
        {[
          { label: "Multiplicador", value: tier.multiplier, sub: tier.multiplierLabel },
          { label: "Potencial", value: tier.potencial, sub: "vs. techo del rol" },
          { label: "Percentil", value: tier.percentile, sub: "en tu compañía" },
        ].map((c) => (
          <div key={c.label} className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink-muted">
              {c.label}
            </p>
            <p
              className="mt-1 font-display font-bold text-ink"
              style={{ fontSize: "1.2rem" }}
            >
              {c.value}
            </p>
            <p className="text-[11px] text-ink-soft mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      <blockquote
        className="mt-6 italic text-ink-soft border-l-2 border-ink/20 pl-4"
        style={{ background: "var(--tw-cream, transparent)", fontSize: 14 }}
      >
        {tier.quote}
      </blockquote>
    </SectionCard>
  );
}

// -------- Capa Banner --------
function CapaBanner({ tier }: { tier: ReturnType<typeof tierById> }) {
  return (
    <section
      className="bg-ink text-white mb-5 flex items-center justify-between flex-wrap gap-4"
      style={{ borderRadius: 16, padding: "1.4rem 1.75rem" }}
    >
      <div>
        <p className="text-[11px] uppercase tracking-widest opacity-50">
          Capa {tier.capaNum} de 06 · Cada capa multiplica
        </p>
        <p className="font-display mt-1" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {tier.capa}
        </p>
        <p className="text-[12px] opacity-70 mt-1">{tier.tech}</p>
      </div>
      <span
        className="rounded-full font-medium"
        style={{
          background: tier.color,
          color: "#fff",
          padding: "8px 14px",
          fontSize: 12,
        }}
      >
        × {tier.multiplier}
      </span>
    </section>
  );
}

// -------- Dimensions --------
function DimensionsCard({
  dimScores,
  tierColor,
}: {
  dimScores: Diagnostic["dim_scores"];
  tierColor: string;
}) {
  return (
    <SectionCard>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Dimensiones
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Tu puntaje por cada uno de los 7 ejes del método.
      </p>
      <div className="mt-5 flex flex-col gap-3">
        {DIMENSIONS.map((d) => {
          const v = Number((dimScores as unknown as Record<string, number>)[d] ?? 0);
          const max = DIM_MAX[d];
          return (
            <div key={d} className="flex items-center gap-3">
              <div style={{ width: 115 }} className="text-[13px] text-ink">
                {d}
              </div>
              <div className="flex-1 h-2.5 rounded-full bg-ink/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(v / max) * 100}%`, background: tierColor }}
                />
              </div>
              <div className="text-[12px] text-ink-muted" style={{ width: 44 }}>
                {v}/{max}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// -------- Radar --------
function RadarCard({
  dimScores,
  tierColor,
}: {
  dimScores: Diagnostic["dim_scores"];
  tierColor: string;
}) {
  const userData = DIMENSIONS.map((d) =>
    Math.round(
      (((dimScores as unknown as Record<string, number>)[d] ?? 0) / DIM_MAX[d]) * 100,
    ),
  );

  return (
    <SectionCard>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Comparativa radar
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Tu perfil vs. el promedio y el top 10%.
      </p>
      <div style={{ height: 280 }} className="mt-4">
        <Radar
          data={{
            labels: [...DIMENSIONS],
            datasets: [
              {
                label: "Tú",
                data: userData,
                backgroundColor: tierColor + "22",
                borderColor: tierColor,
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: tierColor,
              },
              {
                label: "Promedio",
                data: AVG_LINE,
                borderColor: "#999",
                backgroundColor: "transparent",
                borderDash: [3, 3],
                pointRadius: 0,
                borderWidth: 1.5,
              },
              {
                label: "Top 10%",
                data: TOP_LINE,
                borderColor: "#2ECC71",
                backgroundColor: "transparent",
                borderDash: [4, 3],
                pointRadius: 0,
                borderWidth: 1.5,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                suggestedMin: 0,
                suggestedMax: 100,
                ticks: { display: false, stepSize: 20 },
                grid: { color: "#e6e2da" },
                angleLines: { color: "#e6e2da" },
                pointLabels: { font: { size: 11 }, color: "#3a352e" },
              },
            },
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted justify-center">
        <LegendDot color={tierColor} label="Tú" />
        <LegendDot color="#999" label="Promedio" dashed />
        <LegendDot color="#2ECC71" label="Top 10%" dashed />
      </div>
    </SectionCard>
  );
}

function LegendDot({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="inline-block"
        style={{
          width: 18,
          height: 2,
          background: color,
          borderTop: dashed ? `2px dashed ${color}` : undefined,
          borderRadius: 2,
        }}
      />
      {label}
    </span>
  );
}

// -------- Strengths --------
function StrengthsCard({ dimScores }: { dimScores: Diagnostic["dim_scores"] }) {
  const strong = DIMENSIONS.filter(
    (d) => Number((dimScores as unknown as Record<string, number>)[d] ?? 0) / DIM_MAX[d] >= 0.7,
  );
  if (strong.length === 0) return null;
  return (
    <SectionCard>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Tus fortalezas
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Dimensiones con 70% o más del máximo — apalánquense en ellas.
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {strong.map((d) => {
          const v = Number((dimScores as unknown as Record<string, number>)[d] ?? 0);
          const max = DIM_MAX[d];
          const pct = Math.round((v / max) * 100);
          return (
            <div key={d} className="border border-ink/5 rounded-[12px] p-3">
              <p className="text-[13px] text-ink">{d}</p>
              <div className="mt-2 h-2 rounded-full bg-ink/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: "#6BAE5E" }}
                />
              </div>
              <p className="mt-1 text-[11px] text-ink-muted">
                {v}/{max} · {pct}%
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// -------- Plan --------
function PlanCard({
  tier,
  lowestDim,
  dimScores,
}: {
  tier: ReturnType<typeof tierById>;
  lowestDim: Dimension;
  dimScores: Diagnostic["dim_scores"];
}) {
  const [tab, setTab] = useState<"week" | "month" | "next">("week");
  const dimScore = Number(
    (dimScores as unknown as Record<string, number>)[lowestDim] ?? 0,
  );
  const dimMaxVal = DIM_MAX[lowestDim];
  const pct = Math.round((dimScore / dimMaxVal) * 100);
  const isMax = tier.id === 6;

  const tabs = [
    { key: "week", label: "Esta semana" },
    { key: "month", label: `Próximos ${tier.roadmapDays}` },
    ...(isMax
      ? []
      : [{ key: "next", label: `Ser ${tierById(tier.id + 1).name}` }]),
  ] as const;

  return (
    <SectionCard>
      <div
        className="rounded-[12px] p-4 mb-5"
        style={{ background: tier.colorLight }}
      >
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: tier.colorDark }}
        >
          Mayor oportunidad
        </p>
        <p
          className="font-display mt-1"
          style={{ fontSize: "1.2rem", fontWeight: 700, color: tier.colorDark }}
        >
          {lowestDim}
        </p>
        <p className="text-[12px]" style={{ color: tier.colorDark, opacity: 0.75 }}>
          Tu score: {dimScore}/{dimMaxVal} · {pct}%
        </p>
      </div>

      <div className="flex items-center gap-2 border-b border-ink/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "week" | "month" | "next")}
            className={`px-3 py-2 text-[12px] font-medium border-b-2 -mb-px ${
              tab === t.key
                ? "border-ink text-ink"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "week" && (
          <ol className="flex flex-col gap-3">
            {(tier.oppByDim[lowestDim] ?? tier.roadmap).slice(0, 3).map((it, i) => (
              <PlanItem key={i} index={i + 1} text={it} color={tier.color} />
            ))}
          </ol>
        )}
        {tab === "month" && (
          <ol className="flex flex-col gap-3">
            {tier.roadmap.map((it, i) => (
              <PlanItem key={i} index={i + 1} text={it} color={tier.color} />
            ))}
          </ol>
        )}
        {tab === "next" && !isMax && (
          <ol className="flex flex-col gap-3">
            {tier.nextTierActions.map((it, i) => (
              <PlanItem key={i} index={i + 1} text={it} color={tier.color} />
            ))}
          </ol>
        )}
      </div>
    </SectionCard>
  );
}

function PlanItem({
  index,
  text,
  color,
}: {
  index: number;
  text: string;
  color: string;
}) {
  return (
    <li className="flex gap-3">
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
        style={{ background: color }}
      >
        {index}
      </span>
      <span className="text-[13px] text-ink leading-snug">{text}</span>
    </li>
  );
}

// -------- Position --------
function PositionCard({ tier }: { tier: ReturnType<typeof tierById> }) {
  const rows = [
    { pct: "Top 100%", label: "Base — todos empiezan aquí" },
    { pct: "Top 55%", label: "Ya practican con estructura" },
    { pct: "Top 30%", label: "Integran la IA en sus flujos" },
    { pct: "Top 10%", label: "Dirigen — dejan trabajo hecho de noche" },
    { pct: "Top 5%", label: "Construyen sistemas propios" },
    { pct: "Top 1%", label: "Orquestan agentes al servicio de decisiones" },
  ];
  const activeIdx = tier.id - 1;
  return (
    <SectionCard>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Dónde estás en la curva
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Distribución típica del mercado — tu posición está resaltada.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {rows.map((r, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={r.pct}
              className="flex items-center gap-3 rounded-[10px] px-3 py-2 border transition-opacity"
              style={{
                background: active ? tier.colorLight : "transparent",
                borderColor: active ? tier.color : "rgba(0,0,0,0.06)",
                opacity: active ? 1 : 0.45,
              }}
            >
              <span
                className="text-[12px] font-bold"
                style={{ color: active ? tier.colorDark : undefined, width: 70 }}
              >
                {r.pct}
              </span>
              <span className="text-[13px] text-ink">{r.label}</span>
              {active && (
                <span
                  className="ml-auto text-[10px] uppercase tracking-widest"
                  style={{ color: tier.colorDark }}
                >
                  Tú
                </span>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

// -------- Matriz preview --------
function MatrizPreview({ tier }: { tier: ReturnType<typeof tierById> }) {
  const availability =
    tier.id <= 2
      ? "Estás mapeando principalmente en Q1 (Ridiculist) y Q2 (Asistentes)."
      : tier.id <= 4
        ? "Ya trabajas en Q2 y Q3 — el siguiente salto es habilitar Q4 (Agentes)."
        : "Operas en los 4 cuadrantes — el foco ahora es la calidad de los agentes de Q4.";

  const QUADS = [
    { key: "q2", label: "Q2 · Asistentes", light: "#FEF6E6", dark: "#854F0B", enabled: true },
    { key: "q4", label: "Q4 · Agentes", light: "#E6F2FB", dark: "#0C447C", enabled: tier.id >= 3 },
    { key: "q1", label: "Q1 · Ridiculist", light: "#FDECEA", dark: "#993C1D", enabled: true },
    { key: "q3", label: "Q3 · Automatización", light: "#E6F5F0", dark: "#085041", enabled: tier.id >= 2 },
  ];

  return (
    <SectionCard>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Matriz de actividades
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">{availability}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {QUADS.map((q) => (
          <div
            key={q.key}
            style={{
              background: q.enabled ? q.light : "#F5F1EA",
              borderRadius: 12,
              padding: "1rem",
              opacity: q.enabled ? 1 : 0.45,
            }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-wider"
              style={{ color: q.enabled ? q.dark : "#8a8378" }}
            >
              {q.label}
            </p>
            <p
              className="mt-2 text-[12px]"
              style={{ color: q.enabled ? q.dark : "#8a8378", opacity: 0.75 }}
            >
              {q.enabled ? "Disponible en tu tier" : "Se habilita en el próximo tier"}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// -------- CTA --------
function CTABottom({
  tier,
  onBack,
}: {
  tier: ReturnType<typeof tierById>;
  onBack: () => void;
}) {
  return (
    <section
      className="bg-ink text-white mb-5"
      style={{ borderRadius: 16, padding: "2rem" }}
    >
      <p
        className="font-display"
        style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2 }}
      >
        {tier.cta.headline}
      </p>
      <p className="mt-2 text-[13px] opacity-80">{tier.cta.body}</p>
      <button
        onClick={onBack}
        className="mt-5 rounded-[8px] bg-white text-ink font-medium hover:bg-cream"
        style={{ padding: "10px 18px", fontSize: 13 }}
      >
        {tier.cta.button}
      </button>
    </section>
  );
}
