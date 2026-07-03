import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Diagnostic, Employee } from "@/types";

export interface AwareScores {
  awake: number;
  watch: number;
  align: number;
  relearn: number;
  experiment: number;
}

export interface DashboardData {
  employees: Employee[];
  diagnostics: Diagnostic[];
  filtered: Diagnostic[];
  awareScores: AwareScores | null;
  nts: number;
  loading: boolean;
  reload: () => void;
}

export function useDashboard(areaFilter: string): DashboardData {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { data: emps } = await supabase.from("employees").select("*").order("name");
      const { data: diags } = await supabase
        .from("diagnostics")
        .select("*, employee:employees(*)")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setEmployees((emps ?? []) as Employee[]);
      const latest = new Map<string, Diagnostic>();
      ((diags ?? []) as unknown as Diagnostic[]).forEach((d) => {
        if (d.employee_id && !latest.has(d.employee_id)) latest.set(d.employee_id, d);
      });
      setDiagnostics([...latest.values()]);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const filtered =
    areaFilter === "__all__"
      ? diagnostics
      : diagnostics.filter((d) => d.employee?.area === areaFilter);

  const awareScores = computeAwareScores(filtered, diagnostics);
  const nts = awareScores
    ? Math.round(Object.values(awareScores).reduce((a, b) => a + b, 0) / 5)
    : 0;

  return { employees, diagnostics, filtered, awareScores, nts, loading, reload };
}

function computeAwareScores(filtered: Diagnostic[], all: Diagnostic[]): AwareScores | null {
  if (filtered.length === 0) return null;

  const pctEsceptico = filtered.filter((d) => d.perfil === "Escéptico").length / filtered.length;
  const awake = Math.round((1 - pctEsceptico) * 100);

  const areas = [...new Set(all.map((d) => d.employee?.area).filter(Boolean) as string[])];
  const areasConCobertura = areas.filter(
    (a) => filtered.filter((d) => d.employee?.area === a).length >= 3,
  ).length;
  const watch = areas.length > 0 ? Math.round((areasConCobertura / areas.length) * 100) : 0;

  const filteredAreas = [
    ...new Set(filtered.map((d) => d.employee?.area).filter(Boolean) as string[]),
  ];
  const areaAverages = filteredAreas.map((area) => {
    const recs = filtered.filter((d) => d.employee?.area === area);
    return recs.reduce((s, d) => s + d.total_score, 0) / recs.length;
  });
  const mean = areaAverages.reduce((a, b) => a + b, 0) / (areaAverages.length || 1);
  const variance =
    areaAverages.reduce((s, v) => s + (v - mean) ** 2, 0) / (areaAverages.length || 1);
  const align = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 8)));

  const pctFacAmp =
    filtered.filter((d) => d.perfil === "Facilitador" || d.perfil === "Amplificador").length /
    filtered.length;
  const relearn = Math.round(pctFacAmp * 100);

  const withActivities = filtered.filter((d) => d.activities_q);
  const avgQ34 =
    withActivities.length > 0
      ? withActivities.reduce(
          (s, d) => s + (d.activities_q?.q3 ?? 0) + (d.activities_q?.q4 ?? 0),
          0,
        ) / withActivities.length
      : pctFacAmp * 2;
  const experiment = Math.min(100, Math.round((avgQ34 / 4) * 100));

  return { awake, watch, align, relearn, experiment };
}
