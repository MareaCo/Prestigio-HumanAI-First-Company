import { useState } from "react";
import { useMatriz, type Activity, type Quadrant } from "@/hooks/useMatriz";
import { tierById } from "@/data/scoring";

interface Props {
  tierId: number;
  diagnosticId: string | null;
}

interface QuadDef {
  key: Quadrant;
  label: string;
  color: string;
  light: string;
  dark: string;
  minTier: number;
  method: string;
}

const QUADS: QuadDef[] = [
  { key: "q2", label: "Q2 · Asistentes", color: "#E8A83A", light: "#FEF6E6", dark: "#854F0B", minTier: 2, method: "Copiloto con prompts" },
  { key: "q4", label: "Q4 · Agentes", color: "#1A6E9E", light: "#E6F2FB", dark: "#0C447C", minTier: 4, method: "Sistemas integrados" },
  { key: "q1", label: "Q1 · Ridiculist", color: "#E8534A", light: "#FDECEA", dark: "#993C1D", minTier: 1, method: "Eliminar o delegar" },
  { key: "q3", label: "Q3 · Automatización", color: "#3A8E6E", light: "#E6F5F0", dark: "#085041", minTier: 3, method: "Flujos autónomos" },
];

export function MatrizInteractiva({ tierId, diagnosticId }: Props) {
  const { activities, loading, alert, addActivity, removeActivity } = useMatriz(
    tierId,
    diagnosticId,
  );
  const [name, setName] = useState("");
  const [valor, setValor] = useState("");
  const [freq, setFreq] = useState("");
  const [mins, setMins] = useState<number | "">("");

  const inputBorder =
    alert?.type === "error"
      ? "border-tier1"
      : alert?.type === "warn"
        ? "border-tier3"
        : "border-ink/10";

  async function handleAdd() {
    if (typeof mins !== "number") {
      return;
    }
    await addActivity(name, valor, freq, mins);
    if (!alert) {
      setName("");
      setValor("");
      setFreq("");
      setMins("");
    }
  }

  return (
    <section className="bg-white mb-5 border border-ink/5" style={{ borderRadius: 16, padding: "1.75rem" }}>
      <p className="text-[10px] uppercase tracking-widest text-ink-muted">
        Matriz de actividades
      </p>
      <p className="mt-1 text-[12px] text-ink-soft">
        Describe tus actividades reales y la IA sugiere dónde va cada una.
      </p>

      {/* Form */}
      <div className="mt-5 rounded-[12px] bg-cream p-5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: preparar el reporte semanal de ventas con datos del CRM"
          className={`w-full h-10 px-3 rounded-[8px] border bg-white text-[13px] focus:outline-none focus:border-ink transition-colors ${inputBorder}`}
        />
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          >
            <option value="">Valor…</option>
            <option value="alto">Alto valor</option>
            <option value="bajo">Bajo valor</option>
          </select>
          <select
            value={freq}
            onChange={(e) => setFreq(e.target.value)}
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          >
            <option value="">Frecuencia…</option>
            <option value="alta">Alta frecuencia</option>
            <option value="baja">Baja frecuencia</option>
          </select>
          <input
            type="number"
            min={1}
            value={mins}
            onChange={(e) => setMins(e.target.value ? Number(e.target.value) : "")}
            placeholder="Minutos"
            className="h-10 px-3 rounded-[8px] border border-ink/10 bg-white text-[13px] focus:outline-none focus:border-ink"
          />
        </div>

        {alert && (
          <div
            className="mt-3 rounded-[8px] px-3 py-2 text-[12px]"
            style={{
              background: alert.type === "error" ? "#FDECEA" : "#FEF6E6",
              color: alert.type === "error" ? "#993C1D" : "#854F0B",
            }}
          >
            {alert.msg}
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={loading}
          className="mt-4 w-full sm:w-auto rounded-[8px] bg-ink text-white text-[13px] font-medium px-[18px] py-[10px] hover:bg-ink-soft disabled:opacity-50"
        >
          {loading ? "Analizando…" : "+ Agregar al mapa"}
        </button>
      </div>

      {/* Quadrants */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {QUADS.map((q) => (
          <QuadrantCard
            key={q.key}
            def={q}
            activities={activities.filter((a) => a.quadrant === q.key)}
            tierId={tierId}
            onRemove={removeActivity}
          />
        ))}
      </div>

      {/* Summary */}
      {activities.length > 0 && <ActivitySummary activities={activities} />}
    </section>
  );
}

function QuadrantCard({
  def,
  activities,
  tierId,
  onRemove,
}: {
  def: QuadDef;
  activities: Activity[];
  tierId: number;
  onRemove: (id: string) => void;
}) {
  const isLocked = tierId < def.minTier;
  const tierName = tierById(def.minTier).name;

  return (
    <div
      className="rounded-[12px] p-4 border"
      style={{
        background: isLocked ? "#F5F1EA" : def.light,
        borderColor: isLocked ? "rgba(0,0,0,0.06)" : def.color + "44",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: def.dark }}>
          {def.label}
        </p>
        <span className="text-[10px] text-ink-muted">{activities.length}/5</span>
      </div>
      <p className="text-[11px] mt-1" style={{ color: def.dark, opacity: 0.7 }}>
        {def.method}
      </p>
      {isLocked && (
        <p className="mt-2 text-[11px] italic text-ink-muted">
          Se habilita a nivel {def.minTier} · {tierName}
        </p>
      )}
      <div className="mt-3 flex flex-col gap-2">
        {activities.length === 0 ? (
          <p className="text-[11px] text-ink-muted">Aún sin actividades.</p>
        ) : (
          activities.map((a) => (
            <ActivityCard key={a.id} activity={a} onRemove={onRemove} />
          ))
        )}
      </div>
    </div>
  );
}

function ActivityCard({
  activity,
  onRemove,
}: {
  activity: Activity;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-[10px] px-3 py-2 border border-ink/5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-ink truncate">
            {activity.name}
          </p>
          <p className="text-[11px] text-ink-muted">
            {activity.mins} min · original
          </p>
        </div>
        <button
          onClick={() => onRemove(activity.id)}
          className="text-ink-muted hover:text-tier1 text-[14px] leading-none"
          aria-label="Eliminar"
        >
          ×
        </button>
      </div>
      {activity.locked && (
        <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-ink/10 text-ink-muted">
          Pendiente de nivel
        </span>
      )}
      {activity.analysis && (
        <p className="mt-2 text-[11px]" style={{ color: "#0E4B37" }}>
          ↓ {activity.mins - activity.analysis.minutos_optimizados} min con IA ·{" "}
          ahorra {activity.analysis.minutos_optimizados} min (
          {activity.analysis.porcentaje_reduccion}%) · {activity.analysis.explicacion}
        </p>
      )}
      {activity.unclear && (
        <p className="mt-2 text-[11px]" style={{ color: "#854F0B" }}>
          ⚠ Descripción poco clara — sin estimación
        </p>
      )}
    </div>
  );
}

function ActivitySummary({ activities }: { activities: Activity[] }) {
  const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
  activities.forEach((a) => {
    counts[a.quadrant] += 1;
  });
  const locked = activities.filter((a) => a.locked).length;

  const parts: string[] = [];
  if (counts.q1) parts.push(`${counts.q1} en Q1 por eliminar`);
  if (counts.q2) parts.push(`${counts.q2} en Q2 para asistentes`);
  if (counts.q3) parts.push(`${counts.q3} en Q3 para automatizar`);
  if (counts.q4) parts.push(`${counts.q4} en Q4 para agentes`);

  return (
    <div className="mt-5 rounded-[10px] bg-cream p-4">
      <p className="text-[12px] text-ink">
        <span className="font-medium">{activities.length} actividades mapeadas:</span>{" "}
        {parts.join(" · ")}.
      </p>
      {locked > 0 && (
        <p className="mt-1 text-[11px] text-ink-soft">
          Tienes {locked} {locked === 1 ? "actividad pendiente" : "actividades pendientes"} de nivel — el plan de 30 días te llevará ahí.
        </p>
      )}
    </div>
  );
}
