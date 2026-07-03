import { QUESTIONS, ACTITUD_QUESTIONS, type Dimension } from "./questions";
import { DIM_MAX, MAX_SCORE, TIERS, tierById, type TierData } from "./tiers";

export type DimScoresLocal = Record<Dimension, number>;

export function computeScores(answers: (number | null)[]): {
  total: number;
  dimScores: DimScoresLocal;
  actitud: number;
  tecnico: number;
} {
  const dimScores: DimScoresLocal = {
    Mentalidad: 0,
    Contexto: 0,
    Datos: 0,
    Automatización: 0,
    Calidad: 0,
    Autonomía: 0,
    Liderazgo: 0,
  };
  let actitud = 0;
  let tecnico = 0;
  QUESTIONS.forEach((q, i) => {
    const idx = answers[i];
    // If unanswered, score minimum (1) so total starts at 15 (MIN=15)
    const opt = idx !== null && idx !== undefined ? q.options[idx] : q.options[0];
    const score = opt?.score ?? 1;
    dimScores[q.dimension] += score;
    if (ACTITUD_QUESTIONS.includes(q.id)) actitud += score;
    else tecnico += score;
  });
  const total = actitud + tecnico;
  return { total, dimScores, actitud, tecnico };
}

export function getTier(total: number): TierData {
  return (
    TIERS.find((t) => total >= t.range[0] && total <= t.range[1]) ?? TIERS[0]
  );
}

export { tierById, DIM_MAX, MAX_SCORE };

export function getLowestDim(dimScores: DimScoresLocal): Dimension {
  let lowest: Dimension = "Contexto";
  let lowestPct = Infinity;
  (Object.keys(dimScores) as Dimension[]).forEach((d) => {
    const max = DIM_MAX[d] ?? 8;
    const pct = (dimScores[d] ?? 0) / max;
    if (pct < lowestPct) {
      lowestPct = pct;
      lowest = d;
    }
  });
  return lowest;
}

export function perfilFromTier(
  tierId: number,
): "Escéptico" | "Táctico" | "Facilitador" | "Amplificador" {
  if (tierId === 1) return "Escéptico";
  if (tierId <= 3) return "Táctico";
  if (tierId === 4) return "Facilitador";
  return "Amplificador";
}
