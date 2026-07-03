import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { analyzeActivity, type ActivityAnalysis } from "@/services/analyzeActivity";

export type Quadrant = "q1" | "q2" | "q3" | "q4";

export interface Activity {
  id: string;
  name: string;
  mins: number;
  quadrant: Quadrant;
  analysis: ActivityAnalysis | null;
  unclear: boolean;
  locked: boolean;
}

export type AlertMsg = { msg: string; type: "error" | "warn" } | null;

const MIN_TIER_BY_Q: Record<Quadrant, number> = { q1: 1, q2: 2, q3: 3, q4: 4 };

export function getQuadrantId(valor: string, freq: string): Quadrant {
  if (valor === "alto" && freq === "baja") return "q2";
  if (valor === "alto" && freq === "alta") return "q4";
  if (valor === "bajo" && freq === "baja") return "q1";
  return "q3";
}

export function useMatriz(tierId: number, diagnosticId: string | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertMsg>(null);
  const firstSync = useRef(true);

  const countByQ = useCallback(
    (q: Quadrant) => activities.filter((a) => a.quadrant === q).length,
    [activities],
  );

  // Sync counts to Supabase whenever activities change
  useEffect(() => {
    if (!diagnosticId) return;
    if (firstSync.current) {
      firstSync.current = false;
      return;
    }
    const counts = { q1: 0, q2: 0, q3: 0, q4: 0 };
    activities.forEach((a) => {
      counts[a.quadrant] += 1;
    });
    supabase
      .from("diagnostics")
      .update({ activities_q: counts })
      .eq("id", diagnosticId)
      .then(() => {});
  }, [activities, diagnosticId]);

  const addActivity = useCallback(
    async (name: string, valor: string, freq: string, mins: number) => {
      setAlert(null);
      const trimmed = name.trim();
      if (!trimmed || !valor || !freq || !mins) {
        setAlert({ msg: "Completa todos los campos antes de agregar.", type: "error" });
        return;
      }
      const q = getQuadrantId(valor, freq);
      if (activities.filter((a) => a.quadrant === q).length >= 5) {
        setAlert({ msg: "Este cuadrante ya tiene 5 actividades (máximo).", type: "error" });
        return;
      }
      const locked = tierId < MIN_TIER_BY_Q[q];

      setLoading(true);
      let analysis: ActivityAnalysis | null = null;
      let unclear = false;

      try {
        const raw = await analyzeActivity(trimmed, mins);
        if (!raw.clara) {
          unclear = true;
          setAlert({
            msg: `Descripción poco clara: ${raw.razon_alerta} La actividad se registró sin estimación.`,
            type: "warn",
          });
        } else {
          analysis = raw;
        }
      } catch (err) {
        setAlert({
          msg:
            err instanceof Error && err.message
              ? `${err.message} Actividad registrada sin estimación.`
              : "No se pudo conectar con la IA. Actividad registrada sin estimación.",
          type: "warn",
        });
      }

      setActivities((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: trimmed,
          mins,
          quadrant: q,
          analysis,
          unclear,
          locked,
        },
      ]);
      setLoading(false);
    },
    [activities, tierId],
  );

  const removeActivity = useCallback((id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { activities, loading, alert, addActivity, removeActivity, countByQ };
}
